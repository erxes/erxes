import { generateModels, IModels } from '~/connectionResolvers';
import { withErrorHandling } from '../../../shared/utils';
import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';
import {
  addressDomain,
  buildInboxAddress,
  buildOwnDomainAddress,
  isEmailAddress,
  resolveMailTenant,
} from '@/integrations/mail/utils/address';
import { readConnectedCloudflare } from '@/integrations/mail/utils/cloudflare/connection';
import { platformMailDomain } from '@/integrations/mail/utils/platformConfig';
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

const buildAddress = async (
  models: IModels,
  subdomain: string,
  name: string,
) => {
  const connection = await readConnectedCloudflare(subdomain);

  const address = connection?.zoneName
    ? buildOwnDomainAddress(name, connection.zoneName)
    : buildInboxAddress(
        resolveMailTenant(subdomain),
        name,
        platformMailDomain(subdomain),
      );

  if (await models.MailIntegrations.exists({ address })) {
    throw new Error(
      `${address} already belongs to another inbox — give this one a different name`,
    );
  }

  return address;
};

const resolveSending = async (
  models: IModels,
  parsed: Record<string, unknown>,
  ownInboxId?: string,
) => {
  const sendingAccountId =
    typeof parsed.sendingAccountId === 'string'
      ? parsed.sendingAccountId.trim()
      : '';

  if (!sendingAccountId) {
    return { sendingAccountId: '', sendingAddress: '' };
  }

  const account = await models.MailSendingAccounts.findOne({
    _id: sendingAccountId,
  });

  if (!account) {
    throw new Error('That sending account no longer exists');
  }

  const sendingAddress =
    typeof parsed.sendingAddress === 'string'
      ? parsed.sendingAddress.trim().toLowerCase()
      : '';

  if (!isEmailAddress(sendingAddress)) {
    throw new Error(`"${sendingAddress}" is not a valid email address`);
  }

  if (addressDomain(sendingAddress) !== account.domain) {
    throw new Error(
      `${sendingAddress} is not on ${account.domain} — pick an address on the domain this account sends for`,
    );
  }

  const taken = await models.MailIntegrations.findOne({
    sendingAddress,
    ...(ownInboxId ? { inboxId: { $ne: ownInboxId } } : {}),
  });

  if (taken) {
    throw new Error(`${sendingAddress} already answers for another inbox`);
  }

  return { sendingAccountId, sendingAddress };
};

const normalizeForwardFrom = (value: unknown, address: string) => {
  const forwardFrom =
    typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (!forwardFrom) {
    return '';
  }

  if (!isEmailAddress(forwardFrom)) {
    throw new Error(`${forwardFrom} is not a valid email address`);
  }

  if (forwardFrom === address) {
    throw new Error(
      'The forwarding address cannot be the inbox address itself — that would loop mail back into this inbox',
    );
  }

  return forwardFrom;
};

export const mailCreateIntegration = withErrorHandling(
  async ({ subdomain, data }: IMailIntegrationInput) => {
    const { integrationId, data: jsonData } = data;
    const models = await generateModels(subdomain);
    const parsed = jsonData ? JSON.parse(jsonData) : {};

    await ensureMailIndexes(models, subdomain);

    const inbox = await models.Integrations.findOne({ _id: integrationId });

    const address = await buildAddress(
      models,
      subdomain,
      inbox?.name || 'inbox',
    );

    const sending = await resolveSending(models, parsed);

    await assertSendableIntegration(
      models,
      subdomain,
      sending.sendingAccountId,
    );

    return models.MailIntegrations.create({
      inboxId: integrationId,
      address,
      forwardFrom: normalizeForwardFrom(parsed.forwardFrom, address),
      ...sending,
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

    if (parsed.sendingAccountId !== undefined) {
      const sending = await resolveSending(models, parsed, integration.inboxId);

      await assertSendableIntegration(
        models,
        subdomain,
        sending.sendingAccountId,
      );

      Object.assign(update, sending);
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
