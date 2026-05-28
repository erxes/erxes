import { IContext } from '~/connectionResolvers';

export const agentAssistantMutations = {
  agentAssistantsAdd: async (_parent: undefined, { doc }, { models }: IContext) => {
    return models.AgentAssistants.createAgentAssistant(doc);
  },

  agentAssistantsEdit: async (_parent: undefined, { _id, doc }, { models }: IContext) => {
    return models.AgentAssistants.updateAgentAssistant(_id, doc);
  },

  agentAssistantsRemove: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.AgentAssistants.removeAgentAssistant(_id);
  },
};
