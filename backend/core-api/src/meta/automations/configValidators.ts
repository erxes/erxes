import {
  readLiteralConfigId,
  TAutomationConfigIssue,
  TAutomationConfigValidator,
} from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { isSenderAllowed, resolveAlignedFrom } from '~/utils/email/senders';

const readText = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

// a placeholder or a conditional value only names an address once it resolves
const isTypedAddress = (value: string) =>
  /^[^\s@{}<>]+@[^\s@{}<>]+\.[^\s@{}<>]+$/.test(value);

const checkSender = async (
  models: IModels,
  field: string,
  address: string,
): Promise<TAutomationConfigIssue[]> =>
  (await isSenderAllowed(models, address))
    ? []
    : [
        {
          path: `config.${field}`,
          malformed: true,
          message: `${address} is not a verified sender`,
        },
      ];

/**
 * Checks the senders the way the executor sends. While the From is aligned to
 * the default sender, the picker's confirmed address in fromEmailPlaceHolder
 * is who the mail speaks for, so it is required. Otherwise replies go to the
 * From unless replyToEmail is set, and a typed From answers to a broadcast's
 * rule; a placeholder is checked when it resolves, at send time.
 */
export const validateSendEmailSenders: TAutomationConfigValidator = async ({
  subdomain,
  config,
}) => {
  const models = await generateModels(subdomain);
  const from = readText(config.fromEmailPlaceHolder);

  if (await resolveAlignedFrom(models)) {
    if (!from) {
      return [
        {
          path: 'config.fromEmailPlaceHolder',
          message: 'Choose a reply-to address from the verified senders',
        },
      ];
    }

    return checkSender(models, 'fromEmailPlaceHolder', from);
  }

  const replyTo = readText(config.replyToEmail);
  const picksFrom = (config.type ?? 'default') !== 'default';

  return [
    ...(replyTo ? await checkSender(models, 'replyToEmail', replyTo) : []),
    ...(picksFrom && isTypedAddress(from)
      ? await checkSender(models, 'fromEmailPlaceHolder', from)
      : []),
  ];
};

export const validateAiAgentConfig: TAutomationConfigValidator = async ({
  subdomain,
  config,
}) => {
  const aiAgentId = readLiteralConfigId(config.aiAgentId);

  if (!aiAgentId) {
    return [];
  }

  const models = await generateModels(subdomain);

  return (await models.AiAgents.exists({ _id: aiAgentId }))
    ? []
    : [
        {
          path: 'config.aiAgentId',
          malformed: true,
          message: `AI agent "${aiAgentId}" does not exist; pick one from automationsAiAgents`,
        },
      ];
};

export const validateMessageProConfig: TAutomationConfigValidator = async ({
  subdomain,
  config,
}) => {
  const documentId = readLiteralConfigId(config.documentId);

  if (!documentId) {
    return [];
  }

  const models = await generateModels(subdomain);

  return (await models.Documents.exists({ _id: documentId }))
    ? []
    : [
        {
          path: 'config.documentId',
          malformed: true,
          message: `Document "${documentId}" does not exist`,
        },
      ];
};
