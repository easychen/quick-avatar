import type { AvatarCollection } from '../../core/types.js';
import { count, name } from './meta.js';

export const doteyePaper: AvatarCollection = {
  name,
  count,

  async getImage(index: number): Promise<string> {
    const mod = await import(`./images/${index}.ts`);
    return mod.default as string;
  },

  getFilePath(index: number): string {
    return new URL(`./images/${index}.png`, import.meta.url).pathname;
  },
};
