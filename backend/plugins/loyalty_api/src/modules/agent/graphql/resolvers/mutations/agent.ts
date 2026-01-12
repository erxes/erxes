import { IAgent } from '@/agent/@types';
import { IContext } from '~/connectionResolvers';

export const agentMutations = {
  agentsAdd: async (_root: undefined, doc: IAgent, { models }: IContext) => {
    return await models.Agent.createAgent(doc);
  },
  agentsEdit: async (
    _root: undefined,
    { _id, ...doc }: IAgent & { _id: string },
    { models }: IContext,
  ) => {
    return await models.Agent.updateAgent(_id, doc);
  },
  agentsRemove: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Agent.removeAgent(_id);
  },
};
