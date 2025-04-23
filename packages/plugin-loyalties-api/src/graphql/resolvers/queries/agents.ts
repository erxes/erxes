import { IContext } from "../../../connectionResolver";

const agentQueries = {
  agents: async (_root, _params, { models }: IContext) => {
    return models.Agents.find().lean();
  }
};

export default agentQueries;
