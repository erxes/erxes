// ---------------------------------------------------------------------------
// Advanced Memory — conversation assembly (pure).
//
// Keeps the LLM message array clean and Kimi-safe: recall / working-memory are
// injected ONLY as `system` context messages, never as tool-call frames. When
// both blocks are absent the output is byte-identical to the pre-feature shape.
// ---------------------------------------------------------------------------

export interface ConvoMessage {
  role: string;
  content: string;
}

/**
 * Assemble the turn's message array:
 *   [ workingMemoryBlock?, learnedDigestBlock?, recallBlock?, ...recentHistory, userMessage ]
 * The user message is always last; injected blocks are `system` role.
 */
export function augmentConvo(args: {
  recentHistory: ConvoMessage[];
  userMessage: string;
  recallBlock?: string | null;
  workingMemoryBlock?: string | null;
  // Tenant-shared "Agent knowledge" digest (PII-free by construction —
  // see mastra/learning/sanitize.ts).
  learnedDigestBlock?: string | null;
}): ConvoMessage[] {
  const convo: ConvoMessage[] = [];
  if (args.workingMemoryBlock) {
    convo.push({ role: 'system', content: args.workingMemoryBlock });
  }
  if (args.learnedDigestBlock) {
    convo.push({ role: 'system', content: args.learnedDigestBlock });
  }
  if (args.recallBlock) {
    convo.push({ role: 'system', content: args.recallBlock });
  }
  convo.push(...args.recentHistory);
  convo.push({ role: 'user', content: args.userMessage });
  return convo;
}

/**
 * The stable "who" for resource-scoped memory. A logged-in user's id, or a
 * per-agent fallback when there is no user (so memory never silently merges
 * across agents).
 */
export function deriveResourceId(args: {
  user?: { _id?: string } | null;
  agentId: string;
}): string {
  return args.user?._id || `agent:${args.agentId}`;
}

/**
 * Resource id for the messenger bot path. Prefer the customer id (so memory
 * follows a customer across conversations); fall back to per-conversation.
 */
export function deriveBotResourceId(args: {
  customerId?: string | null;
  conversationId: string;
}): string {
  return args.customerId || `bot:${args.conversationId}`;
}
