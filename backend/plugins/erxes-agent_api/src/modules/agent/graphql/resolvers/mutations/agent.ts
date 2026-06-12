import { IContext } from '~/connectionResolvers';
import { IMastraAgent } from '@/agent/@types/agent';

export const agentMutations = {
  mastraAgentCreate: (
    _parent: undefined,
    { doc }: { doc: IMastraAgent },
    { models }: IContext,
  ) => {
    return models.MastraAgent.createAgent(doc);
  },

  mastraAgentUpdate: (
    _parent: undefined,
    { _id, doc }: { _id: string; doc: Partial<IMastraAgent> },
    { models }: IContext,
  ) => {
    return models.MastraAgent.updateAgent(_id, doc);
  },

  mastraAgentRemove: (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.MastraAgent.removeAgent(_id);
  },
};
