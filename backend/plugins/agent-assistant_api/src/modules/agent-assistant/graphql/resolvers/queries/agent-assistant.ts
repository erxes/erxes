import { IContext } from '~/connectionResolvers';

export const agentAssistantQueries = {
  agentAssistants: async (_parent: undefined, { page = 1, perPage = 20 }, { models }: IContext) => {
    return models.AgentAssistants.getAgentAssistants(page, perPage);
  },

  agentAssistantDetail: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.AgentAssistants.getAgentAssistant(_id);
  },
};
