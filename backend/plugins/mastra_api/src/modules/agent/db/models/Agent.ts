import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { agentSchema } from '@/agent/db/definitions/agent';
import { IMastraAgent, IMastraAgentDocument } from '@/agent/@types/agent';
import { invalidateAgentCache } from '~/mastra/agentRuntime';

export interface IMastraAgentModel extends Model<IMastraAgentDocument> {
  getAgent(_id: string): Promise<IMastraAgentDocument>;
  getAgents(): Promise<IMastraAgentDocument[]>;
  createAgent(doc: IMastraAgent): Promise<IMastraAgentDocument>;
  updateAgent(_id: string, doc: Partial<IMastraAgent>): Promise<IMastraAgentDocument>;
  removeAgent(_id: string): Promise<{ ok: number }>;
}

export const loadAgentClass = (_models: IModels) => {
  class MastraAgent {
    public static async getAgent(_id: string) {
      const agent = await _models.MastraAgent.findOne({ _id });
      if (!agent) throw new Error('Agent not found');
      return agent;
    }

    public static async getAgents() {
      return _models.MastraAgent.find().sort({ createdAt: -1 });
    }

    public static async createAgent(doc: IMastraAgent) {
      return _models.MastraAgent.create(doc);
    }

    public static async updateAgent(_id: string, doc: Partial<IMastraAgent>) {
      const updated = await _models.MastraAgent.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );
      if (!updated) throw new Error('Agent not found');
      invalidateAgentCache(_id);
      return updated;
    }

    public static async removeAgent(_id: string) {
      invalidateAgentCache(_id);
      return _models.MastraAgent.deleteOne({ _id });
    }
  }

  agentSchema.loadClass(MastraAgent);
  return agentSchema;
};
