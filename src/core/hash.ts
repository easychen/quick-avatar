// djb2 变体：同一 seed 始终映射到同一 index
export function hashSeed(seed: string, total: number): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash % total;
}
