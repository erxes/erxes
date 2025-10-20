import { IAgent, IAgentDocument } from '@/agent/@types/agent';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { agentSchema } from '../definitions/agent';

export interface IAgentModel extends Model<IAgentDocument> {
  getAgent(_id: string): Promise<IAgentDocument>;
  getAgents(): Promise<IAgentDocument[]>;
  createAgent(doc: IAgent): Promise<IAgentDocument>;
  updateAgent(_id: string, doc: IAgent): Promise<IAgentDocument>;
  removeAgent(AgentId: string): Promise<{ ok: number }>;
}

export const loadAgentClass = (models: IModels) => {
  class Agent {
    /**
     * Retrieves agent
     */
    public static async getAgent(_id: string) {
      const Agent = await models.Agent.findOne({ _id }).lean();

      if (!Agent) {
        throw new Error('Agent not found');
      }

      return Agent;
    }

    /**
     * Retrieves all agents
     */
    public static async getAgents(): Promise<IAgentDocument[]> {
      return models.Agent.find().lean();
    }

    /**
     * Create a agent
     */
    public static async createAgent(doc: IAgent): Promise<IAgentDocument> {
      return models.Agent.create(doc);
    }

    /*
     * Update agent
     */
    public static async updateAgent(_id: string, doc: IAgent) {
      return await models.Agent.findOneAndUpdate({ _id }, { $set: { ...doc } });
    }

    /**
     * Remove agent
     */
    public static async removeAgent(AgentId: string[]) {
      return models.Agent.deleteOne({ _id: { $in: AgentId } });
    }
  }

  agentSchema.loadClass(Agent);

  return agentSchema;
};
