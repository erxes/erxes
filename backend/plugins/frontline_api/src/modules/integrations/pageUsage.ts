import { IModels } from '~/connectionResolvers';

export type TPageUsage = {
  integrationId: string;
  integrationName?: string;
  channelId?: string;
  channelName?: string;
};

/** Where an already connected page lives, so the connect dialog can say so. */
export const getPageUsage = async (
  models: IModels,
  integrationId?: string,
): Promise<TPageUsage | null> => {
  if (!integrationId) {
    return null;
  }

  const integration = await models.Integrations.findOne(
    { _id: integrationId },
    { name: 1, channelId: 1 },
  ).lean();

  if (!integration) {
    return { integrationId };
  }

  const channel = integration.channelId
    ? await models.Channels.findOne(
        { _id: integration.channelId },
        { name: 1 },
      ).lean()
    : null;

  return {
    integrationId,
    integrationName: integration.name,
    channelId: integration.channelId,
    channelName: channel?.name,
  };
};
