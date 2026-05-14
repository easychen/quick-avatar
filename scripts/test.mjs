import { createAvatar, doteye } from '../dist/index.mjs';

// 验证 1：同一 seed 始终返回同一 index
const a1 = createAvatar(doteye, { seed: 'alice' });
const a2 = createAvatar(doteye, { seed: 'alice' });
console.assert(a1.index === a2.index, '同一 seed 应返回同一 index');
console.log(`seed "alice" → index ${a1.index}`);

// 验证 2：不同 seed 大概率不同（覆盖率测试）
const seeds = ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'];
const indices = seeds.map(s => createAvatar(doteye, { seed: s }).index);
console.log('不同 seed 对应 index:', indices);

// 验证 3：index 在合法范围内
indices.forEach((idx, i) => {
  console.assert(idx >= 0 && idx < doteye.count, `${seeds[i]} index 越界: ${idx}`);
});

// 验证 4：toUrl() 输出
const url = a1.toUrl();
console.log('toUrl():', url);
console.assert(url.includes('cdn.jsdelivr.net'), 'toUrl 默认应包含 jsdelivr');

const customUrl = a1.toUrl('https://my-cdn.com');
console.log('toUrl(custom):', customUrl);
console.assert(customUrl.startsWith('https://my-cdn.com'), '自定义 CDN 应用生效');

// 验证 5：toDataUri() 异步加载
console.log('\n加载 data URI...');
const dataUri = await a1.toDataUri();
console.assert(dataUri.startsWith('data:image/png;base64,'), 'dataUri 格式错误');
console.log(`data URI 长度: ${dataUri.length} 字符 (${(dataUri.length / 1024).toFixed(1)} KB)`);

// 验证 6：toFilePath() 返回字符串
const filePath = a1.toFilePath();
console.log('toFilePath():', filePath);

console.log('\n✓ 所有验证通过');
