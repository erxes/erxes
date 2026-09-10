import { IContext } from '~/connectionResolvers';
import { IGithubConfig } from '~/modules/githubIntegration/@types/githubConfig';
import { getInstallationOctokit } from '~/utils/githubClient';

export const githubConfigMutations = {
  async upsertGithubConfig(
    _parent: undefined,
    params: IGithubConfig,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const { teamId, installationId, repoName, syncMode } = params;

    if (syncMode !== 'oneWay' && syncMode !== 'twoWay') {
      throw new Error('Invalid GitHub synchronization mode');
    }

    const [team, connection] = await Promise.all([
      models.Team.findOne({ _id: teamId }).lean(),
      models.GithubConnection.findOne({
        installationId,
        subdomain,
        isActive: true,
      }).lean(),
    ]);

    if (!team) {
      throw new Error('Team not found');
    }

    if (!connection) {
      throw new Error('GitHub organization connection not found');
    }

    const conflictingConfig = await models.GithubConfig.findOne({
      repoName,
      subdomain,
      teamId: { $ne: teamId },
    }).lean();

    if (conflictingConfig) {
      throw new Error(
        'This GitHub repository is already linked to another team',
      );
    }

    const [owner, repository] = repoName.split('/');

    if (!owner || !repository) {
      throw new Error('Invalid GitHub repository name');
    }

    try {
      const octokit = await getInstallationOctokit(installationId);
      const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo: repository,
      });

      if (response.data.full_name.toLowerCase() !== repoName.toLowerCase()) {
        throw new Error(
          'GitHub repository does not match the selected installation',
        );
      }
    } catch {
      throw new Error(
        'The selected repository is not accessible through this GitHub organization',
      );
    }

    const config = await models.GithubConfig.upsertConfig({
      ...params,
      subdomain,
    });
    return config;
  },

  async operationGithubDisconnectTeam(
    _parent: undefined,
    { teamId }: { teamId: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const team = await models.Team.findOne({ _id: teamId }).lean();

    if (!team) {
      throw new Error('Team not found');
    }

    await models.GithubConfig.deleteOne({ teamId, subdomain });

    return { success: true };
  },
};
