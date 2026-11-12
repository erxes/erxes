import {
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecution,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import {
  AUTOMATED_REPLY_REASON,
  AUTOMATED_REPLY_STATUS,
} from '@/inbox/db/definitions/constants';
import { DEFAULT_AUTOMATED_REPLY_PAUSE_MINUTES } from '@/inbox/services/automatedReplyPause';
import { resolveInboxConversationId } from '@/ticket/utils/conversationTickets';
import { IModels } from '~/connectionResolvers';

const MAX_PAUSE_MINUTES = 7 * 24 * 60;

const toIds = (value: unknown): string[] =>
  (Array.isArray(value) ? value : String(value ?? '').split(','))
    .map((id) => String(id ?? '').trim())
    .filter(Boolean);

/** Minutes the bot stays quiet: the configured value, else the default. */
export const readHandoffPauseMinutes = (value: unknown) => {
  const minutes = Number(value);

  if (value === undefined || value === null || value === '' || !Number.isFinite(minutes) || minutes <= 0) {
    return DEFAULT_AUTOMATED_REPLY_PAUSE_MINUTES;
  }

  return Math.min(Math.round(minutes), MAX_PAUSE_MINUTES);
};

/**
 * Hands the conversation of this run to people: automated replies pause on it
 * (the same control Facebook, Messenger and Instagram triggers read) and, when
 * named, team members are assigned. Works from Messenger, Facebook and
 * Instagram messages and from conversation triggers, whose ids all resolve to
 * the inbox conversation.
 */
export const executeHandoffAction = async ({
  models,
  subdomain,
  action,
  execution,
  now = new Date(),
}: {
  models: IModels;
  subdomain: string;
  action: IAutomationAction;
  execution: IAutomationExecution;
  now?: Date;
}) => {
  const target = (execution.target || {}) as {
    _id?: string;
    conversationId?: string;
  };
  const conversationId = await resolveInboxConversationId(
    models,
    target.conversationId || target._id,
  );

  if (!conversationId) {
    return buildSkippedAction('no-conversation');
  }

  const config = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });
  const pauseMinutes = readHandoffPauseMinutes(config.pauseMinutes);
  const pausedUntil = new Date(now.getTime() + pauseMinutes * 60_000);
  const assignedUserIds = toIds(config.assignTo);

  await models.Conversations.setAutomatedReplyControl(conversationId, {
    status: AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED,
    reason: AUTOMATED_REPLY_REASON.AUTOMATION,
    pausedUntil,
  });

  if (assignedUserIds.length) {
    await models.Conversations.assignUserConversation(
      [conversationId],
      assignedUserIds[0],
      assignedUserIds,
    );
  }

  return {
    result: {
      conversationId,
      status: AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED,
      pausedUntil: pausedUntil.toISOString(),
      assignedUserIds,
    },
  };
};
