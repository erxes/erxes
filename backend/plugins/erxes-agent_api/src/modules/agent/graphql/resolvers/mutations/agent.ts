import { IContext } from '~/connectionResolvers';

export const agentMutations = {
  mastraAgentCreate: async (_: any, { doc }: any, { models }: IContext) => {
    return models.MastraAgent.createAgent(doc);
  },

  mastraAgentUpdate: async (_: any, { _id, doc }: any, { models }: IContext) => {
    return models.MastraAgent.updateAgent(_id, doc);
  },

  mastraAgentRemove: async (_: any, { _id }: { _id: string }, { models }: IContext) => {
    return models.MastraAgent.removeAgent(_id);
  },
};
