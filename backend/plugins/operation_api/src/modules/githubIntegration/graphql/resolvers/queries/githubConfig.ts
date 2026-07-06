import { IContext } from '~/connectionResolvers';

export const githubConfigQueries = {
  async getGithubConfigByTeam(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models }: IContext,
  ) {
    return models.GithubConfig.findByTeam(teamId);
  },

  async getAllGithubConfigs(
    _parent: undefined,
    { installationId }: { installationId: number },
    { models }: IContext,
  ) {
    return models.GithubConfig.find({ installationId }).lean();
  },
};
