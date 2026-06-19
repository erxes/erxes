// Chat-turn pipeline used by both the blocking GraphQL resolver
// (mastraAgentChat) and the streaming SSE route (/chat/stream). The staged
// functions live in co-located files so each concern stays small:
//
//   prepare.ts  — setup: thread ownership, history replay, memory blocks, auth
//   run.ts      — blocking execution + tool-call fallbacks
//   persist.ts  — native chat-store mirror (persist / patch / title)
//   fallback.ts — pure tool-result → plain-text synthesis
//   types.ts    — shared turn contracts
//
// This module re-exports the staged interface so callers (routes.ts SSE,
// runner.ts, the chat resolver) keep importing from `@/agent/turn` unchanged —
// they drive the stages individually to interleave streaming. Pure relocation;
// no behavioural change.

export {
  HISTORY_LIMIT,
  type ToolResultLike,
  type TurnAuthCtx,
  type TurnMessage,
  type AgentTurnResult,
  type TurnAgent,
  type MemoryBinding,
  type PreparedTurn,
} from '@/agent/types';

export {
  isSearchResult,
  isRealToolData,
  buildFallbackFromResults,
} from '@/agent/fallback';

export { prepareChatTurn } from '@/agent/prepare';

export {
  runAgentTurn,
  toUserFacingError,
  dedupeToolResults,
  logToolResults,
  synthesizeFromToolResults,
} from '@/agent/run';

export { persistTurn, patchNativeTurn } from '@/agent/persist';
