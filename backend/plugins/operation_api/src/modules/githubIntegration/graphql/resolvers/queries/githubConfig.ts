import { IContext } from '~/connectionResolvers';

export const githubConfigQueries = {
  async getGithubConfigByTeam(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain }: IContext,
  ) {
    return models.GithubConfig.findByTeam(teamId, subdomain);
  },

  async getAllGithubConfigs(
    _parent: undefined,
    { installationId }: { installationId: number },
    { models, subdomain }: IContext,
  ) {
    return models.GithubConfig.find({ installationId, subdomain }).lean();
  },
};
