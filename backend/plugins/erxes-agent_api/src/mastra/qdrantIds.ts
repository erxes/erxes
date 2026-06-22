// ---------------------------------------------------------------------------
// Deterministic UUID-shaped Qdrant point ids from a seed string. Qdrant point
// ids must be a UUID or unsigned integer; hashing a stable seed (subdomain +
// source id) gives idempotent upserts without storing a separate id map.
// ---------------------------------------------------------------------------

import { createHash } from 'crypto';

/** A deterministic UUID-shaped id from `seed` (sha256 → 8-4-4-4-12 hex). */
export function uuidFromHash(seed: string): string {
  const hex = createHash('sha256').update(seed).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16,
  )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
