import { IContext } from '~/connectionResolvers';

export const agentQueries = {
  mastraAgents: async (
    _parent: undefined,
    _args: undefined,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsView');
    return models.MastraAgent.getAgents(user?._id);
  },

  mastraAgent: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsView');
    return models.MastraAgent.getAgent(_id, user?._id);
  },

  mastraAgentsMain: async (
    _parent: undefined,
    params: { page?: number; perPage?: number; searchValue?: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsView');
    return models.MastraAgent.getAgentsList({
      ...(params || {}),
      userId: user?._id,
    });
  },
};
