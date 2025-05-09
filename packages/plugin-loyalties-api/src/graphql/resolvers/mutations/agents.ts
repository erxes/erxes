import { IContext } from "../../../connectionResolver";
import { IAgent, IAgentDocument } from "../../../models/definitions/agents";

const agentMutations = {
  agentsAdd: async (_root, params: IAgent, { models }: IContext) => {
    const agent = await models.Agents.createAgent(params);

    return agent;
  },
  agentsEdit: async (_root, params: IAgentDocument, { models }: IContext) => {
    const agent = await models.Agents.getAgent(params._id);
    const updated = await models.Agents.updateAgent(agent._id, params);

    return updated;
  }
};

export default agentMutations;
