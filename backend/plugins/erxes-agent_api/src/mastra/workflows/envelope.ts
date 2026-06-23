import { z } from 'zod';

/**
 * The trigger envelope — the normalization layer between every event source
 * and the workflow kernel. A workflow triggered by a Facebook message and one
 * triggered by a nightly cron see the identical shape; `channelRef` is the
 * only concession to conversational sources and is optional metadata, not a
 * kernel concept (see docs/WORKFLOW-SPEC.md §4.1).
 */
export const triggerEnvelopeSchema = z.object({
  source: z.enum(['automation', 'schedule', 'webhook', 'manual', 'workflow']),
  // Source-specific event type, e.g. "frontline:facebook.messages".
  type: z.string(),
  // The full target document / webhook body / manual input.
  payload: z.record(z.any()).default({}),
  actor: z
    .object({
      kind: z.enum(['customer', 'user', 'system']),
      id: z.string(),
    })
    .optional(),
  // Where a response can be delivered, when the source is conversational.
  channelRef: z
    .object({
      kind: z.string(),
      id: z.string(),
    })
    .optional(),
});

export type TriggerEnvelope = z.infer<typeof triggerEnvelopeSchema>;

/** Builds the envelope for an on-demand (chat/UI) run with the user as actor. */
export function buildManualEnvelope(
  payload: Record<string, unknown>,
  userId?: string,
): TriggerEnvelope {
  return {
    source: 'manual',
    type: 'manual',
    payload: payload || {},
    actor: userId ? { kind: 'user', id: userId } : undefined,
  };
}

/** Builds the envelope for an erxes Automation firing, carrying its target document. */
export function buildAutomationEnvelope(args: {
  triggerType: string;
  target: Record<string, unknown>;
  channelRef?: { kind: string; id: string };
}): TriggerEnvelope {
  return {
    source: 'automation',
    type: args.triggerType,
    payload: args.target || {},
    channelRef: args.channelRef,
  };
}
