import {
  readLiteralConfigId,
  TAutomationConfigValidator,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { isSenderAllowed, resolveAlignedFrom } from '~/utils/email/senders';

/**
 * Replies must reach a sender the workspace verified. The builder's picker
 * writes it to replyToEmail, or to fromEmailPlaceHolder while the From is
 * aligned to the default sender — the same split the executor sends with.
 */
export const validateSendEmailReplyTo: TAutomationConfigValidator = async ({
  subdomain,
  config,
}) => {
  const models = await generateModels(subdomain);
  const field = (await resolveAlignedFrom(models))
    ? 'fromEmailPlaceHolder'
    : 'replyToEmail';
  const value = config[field];
  const address = typeof value === 'string' ? value.trim() : '';
  const path = `config.${field}`;

  if (!address) {
    return [
      { path, message: 'Choose a reply-to address from the verified senders' },
    ];
  }

  if (!(await isSenderAllowed(models, address))) {
    return [
      { path, malformed: true, message: `${address} is not a verified sender` },
    ];
  }

  return [];
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
