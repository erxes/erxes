import { getEnv } from 'erxes-api-shared/utils';

/**
 * Response-size guard for agent tool calls.
 *
 * A tool that answers with an unbounded payload (an open-ended `find`, a fat
 * aggregation) stalls the agent run and freezes the chat UI while the model
 * ingests it. Every agent GraphQL result is therefore capped at a
 * serialized byte budget — mirroring the 64KB output cap code mode already
 * enforces — and oversized results are rejected with actionable guidance so
 * the model retries with a narrower call instead of the platform streaming an
 * unbounded payload.
 */
export const AGENT_TOOL_DEFAULT_MAX_RESPONSE_BYTES = 64 * 1024;

/**
 * Budget for a GraphQL call made from inside the code-mode sandbox. The
 * program's own return value is what reaches the model, and code mode caps
 * that separately, so a program can page, count and group a large result.
 */
export const AGENT_CODE_MODE_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

/**
 * Resolve the active byte budget. `AGENT_TOOLS_MAX_RESPONSE_BYTES` overrides
 * the 64KB default; non-numeric or non-positive values fall back to it.
 */
export const getAgentToolMaxResponseBytes = (): number => {
  const raw = getEnv({ name: 'AGENT_TOOLS_MAX_RESPONSE_BYTES' });
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : AGENT_TOOL_DEFAULT_MAX_RESPONSE_BYTES;
};

/**
 * Returns the serialized UTF-8 byte size of `result` when it exceeds
 * `maxBytes`, or null when it fits (or cannot be serialized — in which case
 * the regular response path reports the serialization failure as before).
 */
export const oversizedAgentToolResultBytes = (
  result: unknown,
  maxBytes: number,
): number | null => {
  let serialized: string;

  try {
    serialized = JSON.stringify(result) ?? '';
  } catch {
    return null;
  }

  const bytes = Buffer.byteLength(serialized, 'utf8');

  return bytes > maxBytes ? bytes : null;
};

/** Build the structured too-large error returned to the agent. */
export const agentToolResponseTooLargeError = (
  toolId: string,
  resultBytes: number,
  maxBytes: number,
): Error =>
  Object.assign(
    new Error(
      `Agent tool '${toolId}' returned ${resultBytes} bytes, exceeding the ` +
        `${maxBytes}-byte agent tool response limit. Do not retry the same ` +
        `call as-is: paginate with limit/skip or a cursor, tighten the ` +
        `filter, project fewer fields, or use the matching count/findOne ` +
        `tool instead.`,
    ),
    { code: 'RESPONSE_TOO_LARGE' },
  );

const byteSize = (value: unknown) =>
  Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');

type ListSlot = {
  path: string;
  owner: Record<string, unknown> | unknown[];
  key: string | number;
  list: unknown[];
};

// Every array in the result with where it sits, so the largest can be cut first.
const collectLists = (
  value: unknown,
  path: string,
  slots: ListSlot[],
): void => {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (Array.isArray(child)) {
      slots.push({
        path: childPath,
        owner: value as Record<string, unknown>,
        key,
        list: child,
      });
    }
    collectLists(child, childPath, slots);
  }
};

/**
 * Cut the result's longest lists until it fits `maxBytes`, keeping each
 * list's first items. Returns the cut result and what was dropped, or null
 * when no list cut can make it fit.
 */
export const truncateToByteBudget = <T>(
  data: T,
  maxBytes: number,
): {
  data: T;
  truncated: { path: string; kept: number; total: number }[];
} | null => {
  const copy = structuredClone(data);
  const slots: ListSlot[] = [];
  collectLists(copy, '', slots);
  slots.sort((a, b) => b.list.length - a.list.length);

  const truncated: { path: string; kept: number; total: number }[] = [];

  for (const slot of slots) {
    if (byteSize(copy) <= maxBytes) break;
    const full = slot.list;
    let low = 0;
    let high = full.length;
    // Largest prefix length that fits, by binary search over the whole result.
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      (slot.owner as Record<string | number, unknown>)[slot.key] = full.slice(
        0,
        mid,
      );
      if (byteSize(copy) <= maxBytes) low = mid;
      else high = mid - 1;
    }
    (slot.owner as Record<string | number, unknown>)[slot.key] = full.slice(
      0,
      low,
    );
    if (low < full.length) {
      truncated.push({ path: slot.path, kept: low, total: full.length });
    }
  }

  return byteSize(copy) <= maxBytes ? { data: copy, truncated } : null;
};
