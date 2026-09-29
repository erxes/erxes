import {
  TAiContext,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  MAIL_AI_HISTORY_LIMIT,
  MAIL_DRAFT_COLLECTION,
  MAIL_MESSAGE_COLLECTION,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';
import { actionCreateMailDraft } from '@/integrations/mail/meta/automation/draftMessage';
import { actionSendMailMessage } from '@/integrations/mail/meta/automation/sendMessage';
import {
  TMailTriggerConfig,
  TMailTriggerTarget,
} from '@/integrations/mail/meta/automation/types';
import { htmlToContextText } from '@/integrations/mail/utils/textFormat';

const toFilterList = (value: unknown): string[] =>
  (typeof value === 'string' ? value : '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const toIdList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is string => typeof entry === 'string' && !!entry,
      )
    : [];

const toISOString = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

const toDate = (value?: Date | string) => {
  const date = value instanceof Date ? value : new Date(String(value || ''));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const matchesKeywords = (text: string, keywords: string[]) => {
  if (!keywords.length) {
    return true;
  }

  const haystack = text.toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
};

const matchesMailTrigger = (
  target: TMailTriggerTarget | undefined,
  config: TMailTriggerConfig | undefined,
) => {
  if (!target) {
    return false;
  }

  if (target.senderMismatch && !config?.includeUnverifiedSenders) {
    return false;
  }

  const inboxes = toIdList(config?.integrationIds);

  if (inboxes.length && !inboxes.includes(String(target.integrationId || ''))) {
    return false;
  }

  const senders = toFilterList(config?.fromAddresses);

  if (
    senders.length &&
    !senders.includes(String(target.from || '').toLowerCase())
  ) {
    return false;
  }

  return (
    matchesKeywords(
      String(target.subject || ''),
      toFilterList(config?.subjectKeywords),
    ) &&
    matchesKeywords(
      htmlToContextText(String(target.content || '')),
      toFilterList(config?.keywords),
    )
  );
};

const toHistoryRole = (message: { type?: string; automated?: boolean }) => {
  if (message.type !== MAIL_MESSAGE_TYPES.SENT) {
    return 'customer' as const;
  }

  return message.automated ? ('bot' as const) : ('agent' as const);
};

const resolveReplyAsName = async (models: IModels, integrationId: string) => {
  const integration = await models.MailIntegrations.findByScope(integrationId);

  if (!integration) {
    return undefined;
  }

  return (
    (await models.MailIntegrations.resolveSenderName(integration)) || undefined
  );
};

export const mailAutomationWorkers = {
  receiveActions: async (
    {
      action,
      execution,
      collectionType,
    }: TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS],
    { models, subdomain }: { models: IModels; subdomain: string },
  ) => {
    if (collectionType === MAIL_MESSAGE_COLLECTION) {
      return await actionSendMailMessage({
        models,
        subdomain,
        action,
        execution,
      });
    }

    if (collectionType === MAIL_DRAFT_COLLECTION) {
      return await actionCreateMailDraft({
        models,
        subdomain,
        action,
        execution,
      });
    }

    return { result: null };
  },

  checkCustomTrigger: ({
    collectionType,
    target,
    config,
  }: TAutomationProducersInput[TAutomationProducers.CHECK_CUSTOM_TRIGGER]) => {
    if (collectionType !== MAIL_MESSAGE_COLLECTION) {
      return false;
    }

    return matchesMailTrigger(
      target as TMailTriggerTarget | undefined,
      config as TMailTriggerConfig | undefined,
    );
  },

  generateAiContext: async (
    {
      target,
      triggerType,
    }: TAutomationProducersInput[TAutomationProducers.GENERATE_AI_CONTEXT],
    { models }: { models: IModels },
  ): Promise<TAiContext | null> => {
    if (!target) {
      return null;
    }

    const triggerTarget = target as TMailTriggerTarget;

    const [triggerMessage, replyAsName] = await Promise.all([
      models.MailMessages.findOne({ _id: triggerTarget._id }).lean(),
      resolveReplyAsName(models, triggerTarget.integrationId),
    ]);

    const context: TAiContext = {
      version: 1,
      input: {
        text: [
          triggerTarget.subject,
          htmlToContextText(triggerTarget.content || ''),
        ]
          .filter(Boolean)
          .join('\n\n'),
        id: triggerTarget._id,
        createdAt: toISOString(triggerTarget.createdAt),
      },
      facts: {
        conversationId: triggerTarget.conversationId,
        customerId: triggerTarget.customerId,
        integrationId: triggerTarget.integrationId,
        subject: triggerTarget.subject,
        from: triggerTarget.from,
        fromName: triggerMessage?.from?.[0]?.name,
        senderVerified: !triggerTarget.senderMismatch,
        hasAttachments: triggerTarget.hasAttachments,
        replyAsName,
        triggerType,
      },
      memory: {
        scopeKey:
          triggerTarget.conversationId?.trim() ||
          triggerTarget.customerId?.trim() ||
          undefined,
      },
    };

    if (!triggerTarget.conversationId) {
      return context;
    }

    const cutoff = toDate(triggerTarget.createdAt);

    const messages = await models.MailMessages.find({
      inboxConversationId: triggerTarget.conversationId,
      _id: { $ne: triggerTarget._id },
      ...(cutoff ? { createdAt: { $lte: cutoff } } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(MAIL_AI_HISTORY_LIMIT)
      .lean();

    context.history = messages.reverse().map((message) => ({
      type: 'message',
      role: toHistoryRole(message),
      text: htmlToContextText(message.body || ''),
      createdAt: toISOString(message.createdAt),
      meta: { id: message._id, subject: message.subject },
    }));

    return context;
  },
};
