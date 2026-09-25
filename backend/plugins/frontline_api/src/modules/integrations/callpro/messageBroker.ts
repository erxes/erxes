import { generateModels } from '~/connectionResolvers';
import { withErrorHandling } from '~/shared/utils';
import { isCallProEnabled } from '@/integrations/callpro/config';

const assertEnabled = () => {
  if (!isCallProEnabled()) {
    throw new Error(
      'Call Pro is turned off. Set CALLPRO_ENABLED=true to use it.',
    );
  }
};

export const callProCreateIntegration = withErrorHandling(
  async ({ subdomain, data }) => {
    assertEnabled();

    const { integrationId, data: jsonData } = data;
    const { phoneNumber, recordUrl } = JSON.parse(jsonData || '{}');

    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    const models = await generateModels(subdomain);

    const existing = await models.CallProIntegrations.findOne({
      phoneNumber,
    }).lean();

    if (existing) {
      throw new Error(
        `Integration already exists with this phone number: ${phoneNumber}`,
      );
    }

    return models.CallProIntegrations.create({
      inboxId: integrationId,
      phoneNumber,
      recordUrl,
    });
  },
  'Failed to create integration',
);

export const callProUpdateIntegration = withErrorHandling(
  async ({ subdomain, data }) => {
    assertEnabled();

    const { phoneNumber, recordUrl } = JSON.parse(data.doc.data || '{}');
    const models = await generateModels(subdomain);

    if (phoneNumber) {
      const duplicate = await models.CallProIntegrations.findOne({
        phoneNumber,
        inboxId: { $ne: data.integrationId },
      }).lean();

      if (duplicate) {
        throw new Error(
          `Integration already exists with this phone number: ${phoneNumber}`,
        );
      }
    }

    return models.CallProIntegrations.updateOne(
      { inboxId: data.integrationId },
      { $set: { ...(phoneNumber && { phoneNumber }), recordUrl } },
    );
  },
  'Failed to update integration',
);

export const callProRemoveIntegration = withErrorHandling(
  async ({ subdomain, data }): Promise<string> => {
    const { integrationId } = data;
    const models = await generateModels(subdomain);

    const integration = await models.CallProIntegrations.findOne({
      inboxId: integrationId,
    }).lean();

    if (integration) {
      const selector = { integrationId: integration._id };

      await Promise.all([
        models.CallProConversations.deleteMany(selector),
        models.CallProCustomers.deleteMany(selector),
        models.CallProIntegrations.deleteOne({ _id: integration._id }),
      ]);
    }

    return integrationId;
  },
  'Failed to remove integration',
);

export const callProIntegrationDetail = withErrorHandling(
  async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return models.CallProIntegrations.findOne({
      inboxId: data.integrationId,
    }).select(['-_id', '-inboxId']);
  },
  'Failed to get integration details',
);

export const callProGetAudio = async (
  subdomain: string,
  { erxesApiId, integrationId }: { erxesApiId: string; integrationId: string },
): Promise<string> => {
  const models = await generateModels(subdomain);

  const integration = await models.CallProIntegrations.findOne({
    inboxId: integrationId,
  }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const conversation = await models.CallProConversations.findOne({
    erxesApiId,
  }).lean();

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (!integration.recordUrl) {
    return '';
  }

  return `${integration.recordUrl}&id=${conversation.callId}`;
};
