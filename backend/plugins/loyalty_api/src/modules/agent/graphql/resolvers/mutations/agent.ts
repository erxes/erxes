import { IContext } from '~/connectionResolvers';

export const agentMutations = {
  createAgent: async (_parent: undefined, { name }, { models }: IContext) => {
    return models.Agent.createAgent({ name });
  },

  updateAgent: async (
    _parent: undefined,
    { _id, name },
    { models }: IContext,
  ) => {
    return models.Agent.updateAgent(_id, { name });
  },

  removeAgent: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Agent.removeAgent(_id);
  },
};
