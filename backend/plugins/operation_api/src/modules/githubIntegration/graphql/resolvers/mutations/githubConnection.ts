import { IContext } from '~/connectionResolvers';

export const githubConnectionMutations = {
  async disconnectGithubConnection(
    _parent: undefined,
    { installationId }: { installationId: number },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('teamUpdate');

    const connection = await models.GithubConnection.findOne({
      installationId,
      subdomain,
    });
    if (!connection) {
      throw new Error('Github connection not found');
    }

    const linkedTeamCount = await models.GithubConfig.countDocuments({
      installationId,
      subdomain,
    });

    if (linkedTeamCount > 0) {
      throw new Error(
        `This GitHub organization is still linked to ${linkedTeamCount} team${
          linkedTeamCount === 1 ? '' : 's'
        }`,
      );
    }

    connection.isActive = false;
    await connection.save();

    return { success: true };
  },
};
