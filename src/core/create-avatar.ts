import type { AvatarCollection, AvatarOptions, AvatarResult } from './types.js';
import { hashSeed } from './hash.js';

const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/npm/quick-avatar';

export function createAvatar(
  collection: AvatarCollection,
  options: AvatarOptions
): AvatarResult {
  const index = hashSeed(options.seed, collection.count);
  const defaultCdnBase = options.cdnBase ?? JSDELIVR_BASE;

  return {
    index,
    set: collection.name,

    toDataUri(): Promise<string> {
      return collection.getImage(index);
    },

    toUrl(cdnBase?: string): string {
      const base = (cdnBase ?? defaultCdnBase).replace(/\/$/, '');
      return `${base}/dist/sets/${collection.name}/images/${index}.png`;
    },

    toFilePath(): string {
      return collection.getFilePath(index);
    },

    // Node.js CJS only — not available in browser or Node.js ESM
    toBuffer(): Buffer {
      throw new Error('toBuffer() requires Node.js CJS. Use toDataUri() for browser environments.');
    },
  };
}
