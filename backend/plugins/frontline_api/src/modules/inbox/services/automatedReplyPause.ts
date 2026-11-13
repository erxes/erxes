import type { TAutomatedReplyControl } from '@/inbox/@types/conversations';
import {
  AUTOMATED_REPLY_REASON,
  AUTOMATED_REPLY_STATUS,
} from '@/inbox/db/definitions/constants';
import type { IModels } from '~/connectionResolvers';

/**
 * How long the bot stays quiet after a handoff when nothing set an end: an
 * operator's reply marks the conversation human-active without a pausedUntil,
 * and the bot must not stay off for good.
 */
export const DEFAULT_AUTOMATED_REPLY_PAUSE_MINUTES = 30;

type TPausableConversation = {
  _id: string;
  automatedReplyControl?: TAutomatedReplyControl | null;
};

/** When the pause ends, or undefined when the bot is not paused at all. */
export const getAutomatedReplyPauseEnd = (
  control?: TAutomatedReplyControl | null,
): Date | undefined => {
  if (!control || control.status === AUTOMATED_REPLY_STATUS.ACTIVE) {
    return undefined;
  }

  if (control.pausedUntil) {
    return new Date(control.pausedUntil);
  }

  const since = control.updatedAt ? new Date(control.updatedAt) : new Date(0);

  return new Date(
    since.getTime() + DEFAULT_AUTOMATED_REPLY_PAUSE_MINUTES * 60_000,
  );
};

/**
 * Whether automated replies are held back on this conversation. A pause that
 * has run out is closed here, so the conversation reads active again.
 *
 * Messenger and Instagram triggers read this. Facebook keeps its own
 * idle-based check (bot handoffPauseMinutes) on the same field.
 */
export const isAutomatedReplyPaused = async (
  models: IModels,
  conversation?: TPausableConversation | null,
  now: Date = new Date(),
) => {
  const pauseEnd = getAutomatedReplyPauseEnd(
    conversation?.automatedReplyControl,
  );

  if (!conversation || !pauseEnd) {
    return false;
  }

  if (pauseEnd.getTime() <= now.getTime()) {
    await models.Conversations.setAutomatedReplyControl(conversation._id, {
      status: AUTOMATED_REPLY_STATUS.ACTIVE,
      reason: AUTOMATED_REPLY_REASON.TIMEOUT_EXPIRED,
    });

    return false;
  }

  return true;
};
