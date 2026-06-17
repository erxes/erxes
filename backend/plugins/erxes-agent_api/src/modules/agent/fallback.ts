import { ToolResultLike } from '@/agent/types';

// Pure fallback synthesis: turn raw tool results into a plain-text answer when
// the model itself produced no text. No I/O, no model calls — deterministic
// inspection of the tool payloads only.

// A search_erxes_operations result is navigational (it lists candidate ops),
// never the final answer — the answer comes from execute_erxes_operation.
export function isSearchResult(tr: ToolResultLike): boolean {
  return (tr?.toolName || tr?.name || '')
    .toLowerCase()
    .includes('search_erxes_operations');
}

// True when a tool's return value carries a real answer worth reporting (vs a
// failure payload or empty/null). Covers query lists, mutation records, the raw
// execute_erxes_operation payload (any non-empty object), arrays, and scalars.
export function isRealToolData(data: unknown): boolean {
  if (data === true) return true;
  if (Array.isArray(data)) return true; // even an empty array is a valid "0 results"
  if (data == null) return false;
  if (typeof data !== 'object')
    return typeof data === 'string' && data.length > 0;
  const record = data as Record<string, unknown>;
  if (record.success === false) return false;
  if (record._id) return true;
  if (record.list !== undefined) return true;
  if (record.success === true) return true;
  return Object.keys(record).length > 0;
}

// The loosely-shaped object payload a tool may return — only the fields the
// fallback builder inspects are declared; everything else stays unknown.
interface FallbackPayload {
  success?: boolean;
  _id?: unknown;
  name?: unknown;
  list?: unknown;
  availableStages?: string[];
  instruction?: string;
  message?: string;
  error?: string;
}

/** Pluralized "Found N result(s)." line shared by the array and list branches. */
function formatFoundCount(count: number): string {
  return `Found ${count} result${count !== 1 ? 's' : ''}.`;
}

/** Surface a failed payload's own guidance (stage list, instruction, message). */
function describeFailedResult(payload: FallbackPayload): string | null {
  if (payload.availableStages?.length) {
    const names = payload.availableStages.join(', ');
    return `Which stage? Available: ${names}.`;
  }
  if (payload.instruction) return payload.instruction;
  const msg = payload.message || payload.error;
  if (msg) return `Failed: ${msg}`;
  return null;
}

/** Outcome line for a created/updated/deleted named record; null when not one. */
function describeNamedRecord(
  payload: FallbackPayload,
  op: string,
): string | null {
  if (!payload._id || !payload.name) return null;
  if (op.includes('add') || op.includes('create'))
    return `"${payload.name}" was created successfully.`;
  if (op.includes('edit') || op.includes('update'))
    return `"${payload.name}" was updated successfully.`;
  if (op.includes('remove') || op.includes('delete'))
    return `"${payload.name}" was deleted.`;
  return `Done: "${payload.name}".`;
}

// Build a plain-text message from tool results when the model produces no text.
export function buildFallbackFromResults(
  toolResults: ToolResultLike[],
): string | null {
  for (const tr of toolResults) {
    if (isSearchResult(tr)) continue;

    const data = tr.result ?? tr;

    if (data === true) return 'Action completed successfully.';
    if (Array.isArray(data)) return formatFoundCount(data.length);
    if (!data || typeof data !== 'object') continue;

    const payload = data as FallbackPayload;

    // Explicit failure — surface the tool's own guidance. execute_erxes_operation
    // reports failures under `error`; the GraphQL not-found path uses `message`.
    if (payload.success === false) return describeFailedResult(payload);

    const op: string = (tr.toolName || tr.name || '').toLowerCase();

    const namedOutcome = describeNamedRecord(payload, op);
    if (namedOutcome) return namedOutcome;

    if (payload.list && Array.isArray(payload.list)) {
      return formatFoundCount(payload.list.length);
    }

    if (payload.success === true) return 'Action completed successfully.';
  }
  return null;
}
