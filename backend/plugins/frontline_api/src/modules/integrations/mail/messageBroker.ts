import { generateModels } from '~/connectionResolvers';
import { withErrorHandling } from '../../../shared/utils';
import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';
import { allocateMailAddress } from '@/integrations/mail/utils/allocate';
import {
  normalizeForwardFrom,
  normalizeSenderName,
} from '@/integrations/mail/utils/settings';
import { ensureMailIndexes } from '@/integrations/mail/utils/indexes';
import { assertSendableIntegration } from '@/integrations/mail/utils/transports/readiness';

interface IMailIntegrationInput {
  subdomain: string;
  data: { integrationId: string; data?: string };
}

interface IMailIntegrationUpdateInput {
  subdomain: string;
  data: { integrationId: string; doc?: { data?: string } };
}

interface IMailIntegrationRefInput {
  subdomain: string;
  data: { integrationId: string };
}

export const mailCreateIntegration = withErrorHandling(
  async ({ subdomain, data }: IMailIntegrationInput) => {
    const { integrationId, data: jsonData } = data;
    const models = await generateModels(subdomain);
    const parsed = jsonData ? JSON.parse(jsonData) : {};

    await ensureMailIndexes(models, subdomain);

    const inbox = await models.Integrations.findOne({ _id: integrationId });

    const address = await allocateMailAddress(
      models,
      subdomain,
      inbox?.name || 'inbox',
    );

    await assertSendableIntegration(subdomain);

    return models.MailIntegrations.create({
      inboxId: integrationId,
      address,
      forwardFrom: normalizeForwardFrom(parsed.forwardFrom, address),
      senderName: normalizeSenderName(parsed.senderName),
      healthStatus: MAIL_HEALTH_STATUSES.HEALTHY,
      error: '',
    });
  },
);

export const mailUpdateIntegration = withErrorHandling(
  async ({ subdomain, data }: IMailIntegrationUpdateInput) => {
    const models = await generateModels(subdomain);
    const parsed = data.doc?.data ? JSON.parse(data.doc.data) : {};

    const integration = await models.MailIntegrations.findOne({
      inboxId: data.integrationId,
    });

    if (!integration) {
      throw new Error('Mail integration not found');
    }

    const update: Record<string, unknown> = {
      healthStatus: MAIL_HEALTH_STATUSES.HEALTHY,
      error: '',
    };

    if (parsed.forwardFrom !== undefined) {
      update.forwardFrom = normalizeForwardFrom(
        parsed.forwardFrom,
        integration.address,
      );
    }

    if (parsed.senderName !== undefined) {
      update.senderName = normalizeSenderName(parsed.senderName);
    }

    return models.MailIntegrations.updateOne(
      { inboxId: data.integrationId },
      { $set: update },
    );
  },
);

export const mailRemoveIntegrations = async ({
  subdomain,
  data,
}: IMailIntegrationRefInput): Promise<string> => {
  const { integrationId } = data;
  const models = await generateModels(subdomain);

  const conversationIds = await models.MailMessages.distinct(
    'inboxConversationId',
    { inboxIntegrationId: integrationId },
  );

  await models.MailMessages.deleteMany({
    inboxIntegrationId: integrationId,
  });
  await models.MailCustomers.deleteMany({
    inboxIntegrationId: integrationId,
  });
  await models.MailIntegrations.deleteMany({ inboxId: integrationId });

  if (conversationIds.length) {
    await models.ConversationMessages.deleteMany({
      conversationId: { $in: conversationIds },
    });
    await models.Conversations.deleteMany({
      _id: { $in: conversationIds },
    });
  }

  return integrationId;
};

export const mailIntegrationDetails = withErrorHandling(
  async ({ subdomain, data }: IMailIntegrationRefInput) => {
    const models = await generateModels(subdomain);

    const integration = await models.MailIntegrations.findOne({
      inboxId: data.integrationId,
    })
      .select(['-_id', '-inboxId'])
      .lean();

    if (!integration) {
      return null;
    }

    return integration;
  },
  'Failed to get integration details',
);
