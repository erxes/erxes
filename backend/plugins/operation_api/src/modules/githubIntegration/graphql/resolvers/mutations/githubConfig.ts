import { IContext } from '~/connectionResolvers';
import { IGithubConfigDocument } from '~/modules/githubIntegration/@types/githubConfig';

export const githubConfigMutations = {
  async upsertGithubConfig(
    _parent: undefined,
    params: IGithubConfigDocument,
    { models }: IContext,
  ) {
    const config = await models.GithubConfig.upsertConfig(params);
    return config;
  },
};
