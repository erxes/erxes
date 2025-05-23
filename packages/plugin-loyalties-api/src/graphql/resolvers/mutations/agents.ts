import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { IAgent, IAgentDocument } from "../../../models/definitions/agents";
import { MODULE_NAMES, putCreateLog, putDeleteLog, putUpdateLog } from "../../../logUtils";

const agentMutations = {
  agentsAdd: async (_root, params: IAgent, { models, subdomain, user }: IContext) => {
    const agent = await models.Agents.createAgent(params);

    await putCreateLog(
      models,
      subdomain,
      { type: MODULE_NAMES.AGENT, newData: agent, object: agent },
      user
    );

    return agent;
  },
  agentsEdit: async (_root, params: IAgentDocument, { models, subdomain, user }: IContext) => {
    const agent = await models.Agents.getAgent(params._id);
    const updated = await models.Agents.updateAgent(agent._id, params);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.AGENT,
        object: agent,
        newData: params,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },
  agentsRemove: async (_root, params: { _id: string }, { models, subdomain, user }: IContext) => {
    const agent = await models.Agents.getAgent(params._id);
    const removed = await models.Agents.removeAgent(params._id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.AGENT, object: agent },
      user
    );
    
    return removed;
  }
};

moduleRequireLogin(agentMutations);

export default agentMutations;
