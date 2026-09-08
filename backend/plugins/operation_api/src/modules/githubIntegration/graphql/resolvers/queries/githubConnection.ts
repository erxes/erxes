import { IContext } from '~/connectionResolvers';
import { getInstallationOctokit } from '~/utils/githubClient';

export const githubConnectionQueries = {
  async getGithubConnection(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    return models.GithubConnection.findOne({
      isActive: true,
      subdomain,
    })
      .sort({ orgName: 1 })
      .lean();
  },

  async getGithubConnections(
    _parent: undefined,
    _args: undefined,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

    const connections = await models.GithubConnection.find({
      isActive: true,
      subdomain,
    })
      .sort({ orgName: 1 })
      .lean();
    return connections;
  },

  async getGithubRepositories(
    _parent: undefined,
    { installationId }: { installationId: number },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamRead');

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
