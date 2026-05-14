/**
 * 读取 avatars/{setName}/*.png，生成：
 *   src/sets/{setName}/images/0.ts … N.ts   （base64 data URI）
 *   src/sets/{setName}/meta.ts               （count + 文件名映射）
 *   并把 PNG 原文件复制到 dist/sets/{setName}/images/（供 CDN toUrl 使用）
 *
 * 用法：
 *   npx tsx scripts/generate.ts [setName]
 *   npx tsx scripts/generate.ts          # 处理 avatars/ 下所有目录
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, basename, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const AVATARS_DIR = join(ROOT, 'avatars');
const SRC_SETS_DIR = join(ROOT, 'src', 'sets');
const DIST_SETS_DIR = join(ROOT, 'dist', 'sets');

function sortByNumber(files: string[]): string[] {
  return files.sort((a, b) => {
    const numA = parseInt(basename(a, extname(a)).replace(/\D+/g, ''), 10);
    const numB = parseInt(basename(b, extname(b)).replace(/\D+/g, ''), 10);
    return numA - numB;
  });
}

function generateSet(setName: string) {
  const sourceDir = join(AVATARS_DIR, setName);
  if (!existsSync(sourceDir)) {
    console.error(`[generate] 目录不存在: ${sourceDir}`);
    process.exit(1);
  }

  const pngFiles = sortByNumber(
    readdirSync(sourceDir).filter(f => extname(f).toLowerCase() === '.png')
  );

  if (pngFiles.length === 0) {
    console.error(`[generate] ${setName} 下没有 PNG 文件`);
    process.exit(1);
  }

  const imagesOutDir = join(SRC_SETS_DIR, setName, 'images');
  const distImagesDir = join(DIST_SETS_DIR, setName, 'images');
  mkdirSync(imagesOutDir, { recursive: true });
  mkdirSync(distImagesDir, { recursive: true });

  console.log(`[generate] ${setName}: 处理 ${pngFiles.length} 张图片...`);

  pngFiles.forEach((file, i) => {
    const srcPath = join(sourceDir, file);
    const buf = readFileSync(srcPath);
    const b64 = buf.toString('base64');
    const dataUri = `data:image/png;base64,${b64}`;

    // 生成 base64 模块
    const tsContent = `const image = "${dataUri}";\nexport default image;\n`;
    writeFileSync(join(imagesOutDir, `${i}.ts`), tsContent, 'utf8');

    // 复制原始 PNG（供 CDN toUrl 使用）
    copyFileSync(srcPath, join(distImagesDir, `${i}.png`));

    if ((i + 1) % 10 === 0 || i === pngFiles.length - 1) {
      console.log(`  ${i + 1}/${pngFiles.length} 完成`);
    }
  });

  // 生成 meta.ts
  const metaContent = `export const count = ${pngFiles.length};\nexport const name = "${setName}";\n`;
  writeFileSync(join(SRC_SETS_DIR, setName, 'meta.ts'), metaContent, 'utf8');

  console.log(`[generate] ${setName} 完成 ✓`);
}

// 确定要处理的 set
const arg = process.argv[2];
if (arg) {
  generateSet(arg);
} else {
  const sets = readdirSync(AVATARS_DIR).filter(f =>
    existsSync(join(AVATARS_DIR, f)) &&
    readdirSync(join(AVATARS_DIR, f)).some(sub => extname(sub).toLowerCase() === '.png')
  );
  if (sets.length === 0) {
    console.error('[generate] avatars/ 下没有找到任何 PNG 集合');
    process.exit(1);
  }
  sets.forEach(generateSet);
}
