import { atom } from 'jotai';

/**
 * The message an agent picked "Reply" on, waiting to be sent as the quote on
 * their next WhatsApp message. Mirrors discordReplyToState — same shape, same
 * lifecycle (cleared on send and on switching conversations) — because it
 * solves the identical problem: giving the composer something to render as a
 * cancellable preview strip without threading the pick through prop drilling
 * from wherever in the message list it was triggered.
 *
 * `mid` is Meta's wamid, not our `_id` — it is what handleWhatsappMessage
 * forwards to Meta as `context.message_id`, and Meta only understands its own
 * id.
 */
export type WhatsappReplyTarget = {
  mid: string;
  preview: string;
};

export const whatsappReplyToState = atom<WhatsappReplyTarget | null>(null);
