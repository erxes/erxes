import { IContext } from "../../../connectionResolver";

const agentMutations = {
  agentsAdd: async (_root, doc, { models, subdomain, user }: IContext) => {
    const agent = await models.Agents.createAgent(doc);

    return agent;
  }
};

export default agentMutations;
