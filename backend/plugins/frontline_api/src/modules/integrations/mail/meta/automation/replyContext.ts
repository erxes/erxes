import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { TMailTriggerTarget } from '@/integrations/mail/meta/automation/types';
import { toMailHtml } from '@/integrations/mail/utils/textFormat';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

export type TMailActionParams = {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
};

const asString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const withReplyPrefix = (subject: string) =>
  /^re:/i.test(subject) ? subject : `Re: ${subject}`;

export const resolveMailReplyContext = async (
  { models, subdomain, action, execution }: TMailActionParams,
  label: string,
) => {
  const target = execution?.target as TMailTriggerTarget | undefined;

  if (!target?._id || !target.conversationId) {
    throw new Error(
      `${label} can only run in a workflow started by Email Received`,
    );
  }

  const resolved = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
    keepUnresolvedPlaceholders: false,
  });

  const content = asString(resolved.content);

  if (!content) {
    throw new Error(
      `${label} has no message: check that the step it reads from produced a reply`,
    );
  }

  const [source, integration] = await Promise.all([
    models.MailMessages.findOne({ _id: target._id }).lean(),
    models.MailIntegrations.findByScope(target.integrationId),
  ]);

  if (!source) {
    throw new Error('The email that started this workflow no longer exists');
  }

  if (!integration || integration.disabledAt) {
    throw new Error('The mail inbox of this conversation is not connected');
  }

  const recipient = target.from || source.from?.[0]?.address;

  if (!recipient) {
    throw new Error('Could not determine who to reply to');
  }

  const subject = asString(resolved.subject).replace(/\s+/g, ' ');

  return {
    target,
    recipient,
    body: toMailHtml(content),
    subject: subject || withReplyPrefix(source.subject || target.subject || ''),
    replyToMessageId: source.messageId,
    references: source.references ?? [],
    shouldResolve: resolved.shouldResolve === true,
  };
};
