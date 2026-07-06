import { IContext } from '~/connectionResolvers';
import { IGithubConnection } from '~/modules/githubIntegration/@types/githubConnection';
import { getAppOctokit } from '~/utils/githubClient';

export const githubConnectionMutations = {
  async upsertGithubConnection(
    _parent: undefined,
    params: IGithubConnection,
    { models }: IContext,
  ) {
    const connection = await models.GithubConnection.upsertConnection(params);
    return connection;
  },
  async disconnectGithubConnection(
    _parent: undefined,
    { installationId }: { installationId: number },
    { models, subdomain }: IContext,
  ) {
    try {
      const appOctokit = await getAppOctokit();
      await appOctokit.request('DELETE /app/installations/{installation_id}', {
        installation_id: installationId,
      });

      const connection = await models.GithubConnection.findOne({
        installationId,
        subdomain,
      });
      if (!connection) {
        throw new Error('Github connection not found');
      }
      connection.isActive = false;
      await connection.save();
    } catch (e) {
      console.log('Failed to delete github app installation', e);
    }
    return { success: true };
  },
};
