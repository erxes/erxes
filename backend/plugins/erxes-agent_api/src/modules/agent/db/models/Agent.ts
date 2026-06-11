import { Model } from 'mongoose';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { agentSchema } from '@/agent/db/definitions/agent';
import { IMastraAgent, IMastraAgentDocument } from '@/agent/@types/agent';
import { invalidateAgentCache } from '~/mastra/agentRuntime';

export interface IMastraAgentListParams {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

export interface IMastraAgentListResult {
  list: IMastraAgentDocument[];
  totalCount: number;
}

export interface IMastraAgentModel extends Model<IMastraAgentDocument> {
  getAgent(_id: string): Promise<IMastraAgentDocument>;
  getAgents(): Promise<IMastraAgentDocument[]>;
  getAgentsList(
    params: IMastraAgentListParams,
  ): Promise<IMastraAgentListResult>;
  createAgent(doc: IMastraAgent): Promise<IMastraAgentDocument>;
  updateAgent(
    _id: string,
    doc: Partial<IMastraAgent>,
  ): Promise<IMastraAgentDocument>;
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

    // Offset-paginated list for the Agents settings table (scroll-triggered
    // "load more" on the frontend). Newest first; free-text search across
    // name / id / description / provider / model.
    public static async getAgentsList({
      page = 1,
      perPage = 30,
      searchValue,
    }: IMastraAgentListParams) {
      const filter: Record<string, any> = {};

      if (searchValue) {
        const re = new RegExp(escapeRegExp(searchValue), 'i');
        filter.$or = [
          { name: re },
          { agentId: re },
          { description: re },
          { provider: re },
          { model: re },
        ];
      }

      const limit = Math.min(Math.max(perPage, 1), 100);
      const skip = (Math.max(page, 1) - 1) * limit;

      const [list, totalCount] = await Promise.all([
        _models.MastraAgent.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        _models.MastraAgent.countDocuments(filter),
      ]);

      return { list, totalCount };
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
