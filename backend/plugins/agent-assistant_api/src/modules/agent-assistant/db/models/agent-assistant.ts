import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { agentAssistantSchema } from '@/agent-assistant/db/definitions/agent-assistant';
import { IAgentAssistant, IAgentAssistantDocument } from '@/agent-assistant/@types/agent-assistant';

export interface IAgentAssistantModel extends Model<IAgentAssistantDocument> {
  getAgentAssistant(_id: string): Promise<IAgentAssistantDocument>;
  getAgentAssistants(page: number, perPage: number): Promise<IAgentAssistantDocument[]>;
  createAgentAssistant(doc: IAgentAssistant): Promise<IAgentAssistantDocument>;
  updateAgentAssistant(_id: string, doc: IAgentAssistant): Promise<IAgentAssistantDocument>;
  removeAgentAssistant(_id: string): Promise<{ ok: number }>;
}

export const loadAgentAssistantClass = (models: IModels) => {
  class AgentAssistant {
    /**
     * Retrieves agent assistant by id
     */
    public static async getAgentAssistant(_id: string) {
      const agent = await models.AgentAssistants.findOne({ _id }).lean();

      if (!agent) {
        throw new Error('Agent assistant not found');
      }

      return agent;
    }

    /**
     * Retrieves all agent assistants with pagination
     */
    public static async getAgentAssistants(page: number, perPage: number): Promise<IAgentAssistantDocument[]> {
      return models.AgentAssistants.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean();
    }

    /**
     * Create an agent assistant
     */
    public static async createAgentAssistant(doc: IAgentAssistant): Promise<IAgentAssistantDocument> {
      return models.AgentAssistants.create(doc);
    }

    /**
     * Update agent assistant
     */
    public static async updateAgentAssistant(_id: string, doc: IAgentAssistant) {
      return await models.AgentAssistants.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
        { new: true },
      );
    }

    /**
     * Remove agent assistant
     */
    public static async removeAgentAssistant(_id: string) {
      return models.AgentAssistants.deleteOne({ _id });
    }
  }

  agentAssistantSchema.loadClass(AgentAssistant);

  return agentAssistantSchema;
};
