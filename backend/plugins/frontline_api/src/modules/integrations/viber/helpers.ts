import { generateModels } from '~/connectionResolvers';
import { getViberAccountInfo } from '@/integrations/viber/utils/account';

export const viberCreateIntegration = async (
  subdomain: string,
  integrationId: string,
  token: string,
): Promise<void> => {
  if (!integrationId.trim()) {
    throw new Error('Integration id is required');
  }

  const models = await generateModels(subdomain);

  const inbox = await models.Integrations.exists({ _id: integrationId });

  if (!inbox) {
    throw new Error('Inbox integration not found');
  }

  const account = await getViberAccountInfo(token);

  const existingIntegration = await models.ViberIntegrations.exists({
    $or: [{ inboxId: integrationId }, { botId: account.id }],
  });

  if (existingIntegration) {
    throw new Error('Viber integration already exists');
  }

  await models.ViberIntegrations.create({
    inboxId: integrationId,
    botId: account.id,
    token,
  });
};
