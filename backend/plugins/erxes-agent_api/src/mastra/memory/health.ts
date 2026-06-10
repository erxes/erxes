// ---------------------------------------------------------------------------
// Advanced Memory — Qdrant connectivity state.
//
// Isolated in its own tiny module so both the boot init and the per-request
// recall path can read/update it without an import cycle. Surfaced read-only in
// the Settings status. null = not yet checked.
// ---------------------------------------------------------------------------

import { health as pingQdrant } from './vectorStore';
import { isAdvancedMemoryEnabled } from './config';

let _reachable: boolean | null = null;

export function getMemoryHealth(): boolean | null {
  return _reachable;
}

export function setMemoryHealth(v: boolean | null): void {
  _reachable = v;
}

/** Re-ping Qdrant and update the cached health. */
export async function refreshMemoryHealth(): Promise<boolean> {
  if (!isAdvancedMemoryEnabled()) {
    _reachable = null;
    return false;
  }
  _reachable = await pingQdrant();
  return _reachable;
}
