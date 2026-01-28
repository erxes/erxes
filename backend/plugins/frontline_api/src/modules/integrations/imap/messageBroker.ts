import { generateModels } from '~/connectionResolvers';
import { listenIntegration } from './utils';
import { withErrorHandling } from '../../../shared/utils';

export const imapCreateIntegration = withErrorHandling(
  async ({ subdomain, data }): Promise<any> => {
    const { integrationId, data: jsonData } = data;
    const models = await generateModels(subdomain);
    const parsedData = JSON.parse(jsonData);
    const integration = await models.ImapIntegrations.create({
      inboxId: integrationId,
      healthStatus: 'healthy',
      error: '',
      ...parsedData,
    });
    return integration;
  },
  'Failed to create integration',
);

export const imapUpdateIntegration = withErrorHandling(
  async ({ subdomain, data }): Promise<any> => {
    const models = await generateModels(subdomain);
    const parsedData = JSON.parse(data.doc.data);

    const integration = await models.ImapIntegrations.updateOne(
      { inboxId: data.integrationId },
      {
        $set: {
          healthStatus: 'healthy',
          error: '',
          ...parsedData,
        },
      },
      { upsert: true },
    );
    return integration;
  },
  'Failed to update integration',
);

export const imapRemoveIntegrations = withErrorHandling(
  async ({ subdomain, data }): Promise<string> => {
    const { integrationId } = data;
    const models = await generateModels(subdomain);

    await Promise.all([
      models.ImapMessages.deleteMany({ inboxIntegrationId: integrationId }),
      models.ImapCustomers.deleteMany({ inboxIntegrationId: integrationId }),
      models.ImapIntegrations.deleteMany({ inboxId: integrationId }),
    ]);

    return integrationId;
  },
  'Failed to remove integrations',
);

export const imapGetStatus = withErrorHandling(
  async ({ subdomain, data }): Promise<any> => {
    const { integrationId } = data;
    const models = await generateModels(subdomain);
    const integration = await models.ImapIntegrations.findOne({
      inboxId: integrationId,
    });

    return {
      status: integration?.healthStatus || 'healthy',
      error: integration?.error,
    };
  },
  'Failed to get status',
);
export const imapListen = withErrorHandling(
  async ({ subdomain, data }): Promise<void> => {
    console.log('imapListen', data);
    const { _id } = data;
    const models = await generateModels(subdomain);
    const integration = await models.ImapIntegrations.findById(_id);

    if (!integration) {
      throw new Error(`Integration not found: ${_id}`);
    }

    await listenIntegration(subdomain, integration, models);
  },
  'Failed to listen',
);

export const imapIntegrationDetails = withErrorHandling(
  async ({ subdomain, data }): Promise<any> => {
    const models = await generateModels(subdomain);
    const integrationId = data.integrationId;
    const integration = await models.ImapIntegrations.findOne({
      inboxId: integrationId,
    }).select(['-_id', '-kind', '-erxesApiId', '-inboxId']);

    return integration;
  },
  'Failed to get integration details',
);
export const imapMessageCreate = withErrorHandling(async (): Promise<any> => {
  // TODO: Implement message creation logic
  throw new Error('Message creation not implemented yet');
}, 'Failed to create message');
