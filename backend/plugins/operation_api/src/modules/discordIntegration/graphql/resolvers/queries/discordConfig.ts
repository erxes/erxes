import { IContext } from '~/connectionResolvers';

export const discordConfigQueries = {
  async operationDiscordConfigsByTeam(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.DiscordConfig.listByTeam(teamId, subdomain);
  },

  async operationDiscordConfigs(
    _parent: undefined,
    { connectionId }: { connectionId?: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.DiscordConfig.find({
      subdomain,
      ...(connectionId ? { connectionId } : {}),
    }).lean();
  },
};
