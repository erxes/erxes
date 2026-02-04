import { IAgent } from '@/agent/@types';
import { IContext } from '~/connectionResolvers';

export const agentMutations = {
  async agentsAdd(_root: undefined, doc: IAgent, { models }: IContext) {
    return models.Agents.createAgent(doc);
  },

  async agentsEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IAgent,
    { models }: IContext,
  ) {
    return models.Agents.updateAgent(_id, doc);
  },

  async agentsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Agents.removeAgent(_id);
  },
};
