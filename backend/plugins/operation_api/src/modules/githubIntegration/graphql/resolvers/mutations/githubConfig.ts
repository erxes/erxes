import { IContext } from '~/connectionResolvers';
import { IGithubConfig } from '~/modules/githubIntegration/@types/githubConfig';

export const githubConfigMutations = {
  async upsertGithubConfig(
    _parent: undefined,
    params: IGithubConfig,
    { models, subdomain }: IContext,
  ) {
    const config = await models.GithubConfig.upsertConfig({
      ...params,
      subdomain,
    });
    return config;
  },
};
