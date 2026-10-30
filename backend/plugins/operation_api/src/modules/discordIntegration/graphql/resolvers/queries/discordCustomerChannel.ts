import { IContext } from '~/connectionResolvers';

export const discordCustomerChannelQueries = {
  async operationDiscordCustomerChannels(
    _parent: undefined,
    { connectionId }: { connectionId?: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.DiscordCustomerChannel.find({
      subdomain,
      ...(connectionId ? { connectionId } : {}),
    })
      .sort({ channelName: 1 })
      .lean();
  },
};
