import { IContext } from '~/connectionResolvers';
import { IMastraAgent } from '@/agent/@types/agent';

export const agentMutations = {
  mastraAgentCreate: async (
    _parent: undefined,
    { doc }: { doc: IMastraAgent },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsCreate');
    return models.MastraAgent.createAgent(doc);
  },

  mastraAgentUpdate: async (
    _parent: undefined,
    { _id, doc }: { _id: string; doc: Partial<IMastraAgent> },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsEdit');
    return models.MastraAgent.updateAgent(_id, doc);
  },

  mastraAgentRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsRemove');
    return models.MastraAgent.removeAgent(_id);
  },
};
