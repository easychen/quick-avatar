export interface AvatarCollection {
  name: string;
  count: number;
  getImage: (index: number) => Promise<string>;
  getFilePath: (index: number) => string;
}

export interface AvatarOptions {
  seed: string;
  cdnBase?: string;
}

export interface AvatarResult {
  /** 选中的头像编号（0-based） */
  readonly index: number;
  /** 头像集名称 */
  readonly set: string;
  /** 返回 data URI（异步加载，适合浏览器 SPA） */
  toDataUri(): Promise<string>;
  /** 返回 CDN / 自定义 URL（同步，零 bundle） */
  toUrl(cdnBase?: string): string;
  /** 返回本地文件绝对路径（仅 Node.js） */
  toFilePath(): string;
  /** 返回文件 Buffer（仅 Node.js） */
  toBuffer(): Buffer;
}
