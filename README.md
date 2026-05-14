# quick-avatar

Deterministic PNG avatars for your projects. Pick a seed, get an avatar — no API, no server, no network required.

Inspired by [DiceBear](https://dicebear.com), but uses hand-crafted PNG illustrations instead of generated SVGs.

---

## Installation

```bash
npm install quick-avatar
```

---

## Usage

### Basic (SPA / Browser)

```ts
import { createAvatar, doteye } from 'quick-avatar';

const avatar = createAvatar(doteye, { seed: 'user@example.com' });

// Async: lazy-loads only the matching image chunk (~50 KB)
const src = await avatar.toDataUri();
// → "data:image/png;base64,..."
```

Same seed always returns the same avatar.

### React

```tsx
import { useEffect, useState } from 'react';
import { createAvatar, doteye } from 'quick-avatar';

function Avatar({ userId }: { userId: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    createAvatar(doteye, { seed: userId }).toDataUri().then(setSrc);
  }, [userId]);

  return <img src={src} width={64} height={64} alt="avatar" />;
}
```

### CDN (zero bundle size)

Skip bundling entirely — link directly to the image file via jsDelivr:

```ts
const avatar = createAvatar(doteye, { seed: 'user@example.com' });

// Default: jsDelivr pointing to the published npm package
avatar.toUrl();
// → "https://cdn.jsdelivr.net/npm/quick-avatar/dist/sets/doteye/images/39.png"

// Custom CDN or self-hosted
avatar.toUrl('https://assets.example.com');
// → "https://assets.example.com/dist/sets/doteye/images/39.png"
```

```tsx
<img src={createAvatar(doteye, { seed: userId }).toUrl()} alt="avatar" />
```

### Node.js / SSR

```ts
import { createAvatar, doteye } from 'quick-avatar';

const avatar = createAvatar(doteye, { seed: 'user@example.com' });

// Read as Buffer (e.g. for HTTP response or sharp processing)
const buffer = avatar.toBuffer();
res.setHeader('Content-Type', 'image/png');
res.end(buffer);

// Or get the absolute file path
const filePath = avatar.toFilePath();
// → "/path/to/node_modules/quick-avatar/dist/sets/doteye/images/39.png"
```

---

## API

### `createAvatar(collection, options)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `collection` | `AvatarCollection` | An imported style set, e.g. `doteye` |
| `options.seed` | `string` | Any string — user ID, email, username, etc. |
| `options.cdnBase` | `string` (optional) | Default CDN base URL used by `toUrl()` |

Returns an `AvatarResult`:

| Method / Property | Returns | Notes |
|-------------------|---------|-------|
| `toDataUri()` | `Promise<string>` | Lazy-loads the image as a base64 data URI |
| `toUrl(cdnBase?)` | `string` | CDN URL, synchronous, zero bundle cost |
| `toBuffer()` | `Buffer` | Node.js only — reads the PNG file synchronously |
| `toFilePath()` | `string` | Node.js only — absolute path to the PNG file |
| `index` | `number` | Which avatar was selected (0-based) |
| `set` | `string` | Name of the collection, e.g. `"doteye"` |

---

## Available Style Sets

| Import | Name | Count |
|--------|------|-------|
| `doteye` | Doteye | 64 |

---

## Bundle Size

`quick-avatar` uses code splitting so your bundle only ever includes the image chunks you actually render:

- Core logic (`index.mjs`): **~5 KB**
- Per-image chunk: **~40–100 KB**, loaded on demand
- CDN mode: **0 KB** — images are fetched at runtime, never bundled

---

## Adding a New Style Set

### 1. Add PNG files

Place your images in `avatars/<setName>/`. File names can be anything — they will be sorted numerically and assigned 0-based indices.

```
avatars/
  pixel/
    pixel-avatar-1.png
    pixel-avatar-2.png
    ...
```

### 2. Run the generate script

```bash
npm run generate pixel
# or regenerate all sets at once:
npm run generate
```

This will:
- Convert each PNG to a base64 module in `src/sets/pixel/images/*.ts`
- Write a `src/sets/pixel/meta.ts` with the count and set name
- Copy the original PNG files to `dist/sets/pixel/images/` for CDN use

### 3. Create the collection file

Create `src/sets/pixel/index.ts`:

```ts
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import type { AvatarCollection } from '../../core/types.js';
import { count, name } from './meta.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const pixel: AvatarCollection = {
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
```

### 4. Export from the main entry

Add one line to `src/index.ts`:

```ts
export { createAvatar } from './core/create-avatar.js';
export type { AvatarCollection, AvatarOptions, AvatarResult } from './core/types.js';

export { doteye } from './sets/doteye/index.js';
export { pixel } from './sets/pixel/index.js';  // ← add this
```

### 5. Build

```bash
npm run build
```

Users can now import the new set:

```ts
import { createAvatar, pixel } from 'quick-avatar';
```

---

## Development

```bash
# Install dependencies
npm install

# Regenerate all sets from source PNGs
npm run generate

# Build (clean → generate → compile)
npm run build
```

---

## License

MIT
