import { IContext } from '~/connectionResolvers';
import { getInstallationOctokit } from '~/utils/githubClient';

export const githubConnectionQueries = {
  async getGithubConnection(
    _parent: undefined,
    _args: undefined,
    { models, subdomain }: IContext,
  ) {
    const connection = await models.GithubConnection.findOne({
      isActive: true,
      subdomain,
    }).lean();
    return connection;
  },

  async getGithubRepositories(
    _parent: undefined,
    { installationId }: { installationId: number },
    { models, subdomain }: IContext,
  ) {
    const connection = await models.GithubConnection.findOne({
      installationId,
      subdomain,
      isActive: true,
    }).lean();
    if (!connection) {
      throw new Error('GitHub connection not found');
    }

    const octokit = await getInstallationOctokit(installationId);
    const response = await octokit.request('GET /installation/repositories', {
      per_page: 100,
    });
    return response.data.repositories.map(
      (r: { full_name: string; name: string; private: boolean }) => ({
        fullName: r.full_name,
        name: r.name,
        isPrivate: r.private,
      }),
    );
  },
};
