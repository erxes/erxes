import { IContext } from '~/connectionResolvers';

export const githubConfigQueries = {
  async getGithubConfigByTeam(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.GithubConfig.findByTeam(teamId, subdomain);
  },

  async getAllGithubConfigs(
    _parent: undefined,
    { installationId }: { installationId?: number },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.GithubConfig.find({
      subdomain,
      ...(installationId ? { installationId } : {}),
    }).lean();
  },
};
