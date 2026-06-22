import { ApprovedOp, Message, asApprovalRequest } from '~/modules/chat/types';

// The model often narrates its whole turn before the confirmation; keep only the
// last couple of sentences so the bar stays short.
const lastSentences = (text: string, max = 2): string => {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t
    .split(/(?<=[.?!])\s+/)
    .slice(-max)
    .join(' ');
};

/**
 * A settled assistant turn that ended on one or more destructive ops awaiting
 * the user's go-ahead. Returns the model's confirmation question + the exact ops
 * to replay on approval, or null when nothing is pending. Derived from the last
 * message so it clears automatically once the next turn runs.
 */
export const pendingApproval = (
  messages: Message[],
): { prompt: string; operations: ApprovedOp[] } | null => {
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant' || last.streaming) return null;
  let summary: string | undefined;
  const operations: ApprovedOp[] = [];
  for (const part of last.parts ?? []) {
    if (part.kind === 'tool') {
      const req = asApprovalRequest(part.call.result);
      if (req) {
        // Prefer the model's dedicated request_approval summary.
        if (req.summary && !summary) summary = req.summary;
        operations.push(...req.operations);
      }
    }
  }
  if (!operations.length) return null;
  return {
    // request_approval summary first; otherwise the last sentences of the reply.
    prompt:
      summary || lastSentences(last.content ?? '') || 'Confirm this action?',
    operations,
  };
};
