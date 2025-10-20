import { IContext } from '~/connectionResolvers';

export const agentQueries = {
  getAgent: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Agent.getAgent(_id);
  },

  getAgents: async (_parent: undefined, { models }: IContext) => {
    return models.Agent.getAgents();
  },
};
