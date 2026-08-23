import { getEnv } from '../utils';

/**
 * Response-size guard for agent tool calls.
 *
 * A tool that answers with an unbounded payload (an open-ended `find`, a fat
 * aggregation) stalls the agent run and freezes the chat UI while the model
 * ingests it. Every `/agent-tools/call` result is therefore capped at a
 * serialized byte budget — mirroring the 64KB output cap code mode already
 * enforces — and oversized results are rejected with actionable guidance so
 * the model retries with a narrower call instead of the platform streaming an
 * unbounded payload.
 */
export const AGENT_TOOL_DEFAULT_MAX_RESPONSE_BYTES = 64 * 1024;

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
