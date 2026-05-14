import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { AvatarCollection } from '../../core/types.js';
import { count, name } from './meta.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const doteye: AvatarCollection = {
  name,
  count,

  async getImage(index: number): Promise<string> {
    const mod = await import(`./images/${index}.ts`);
    return mod.default as string;
  },

  getFilePath(index: number): string {
    return resolve(__dirname, 'sets', name, 'images', `${index}.png`);
  },
};
