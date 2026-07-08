import { IContext } from '~/connectionResolvers';
import { IGithubConfig } from '~/modules/githubIntegration/@types/githubConfig';

export const githubConfigMutations = {
  async upsertGithubConfig(
    _parent: undefined,
    params: IGithubConfig,
    { models }: IContext,
  ) {
    const config = await models.GithubConfig.upsertConfig(params);
    return config;
  },
};
