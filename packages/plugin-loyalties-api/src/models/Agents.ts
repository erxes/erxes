import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { agentSchema, IAgent, IAgentDocument } from "./definitions/agents";

export interface IAgentModel extends Model<IAgentDocument> {
  createAgent(doc: IAgent): Promise<IAgentDocument>;
};

export const loadAgentClass = (models: IModels, _subdomain: string) => {
  class Agent {
    public static async createAgent(doc: IAgent) {
      return models.Agents.create(doc);
    }
  }

  agentSchema.loadClass(Agent);

  return agentSchema;
};
