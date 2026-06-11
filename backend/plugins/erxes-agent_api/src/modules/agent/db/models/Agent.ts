import { FilterQuery, Model } from 'mongoose';
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

/** Bind the MastraAgent statics onto the agent schema (mongoose loadClass). */
export const loadAgentClass = (_models: IModels) => {
  /** Static CRUD/query helpers for stored agent configurations. */
  // skipcq: JS-0327 — the mongoose loadClass pattern requires a class of statics
  class MastraAgent {
    /** Fetch one agent config by _id; throws when it does not exist. */
    public static async getAgent(_id: string) {
      const agent = await _models.MastraAgent.findOne({ _id });
      if (!agent) throw new Error('Agent not found');
      return agent;
    }

    /** All agent configs, newest first. */
    public static getAgents() {
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
      const filter: FilterQuery<IMastraAgentDocument> = {};

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

    /** Create a new agent config. */
    public static createAgent(doc: IMastraAgent) {
      return _models.MastraAgent.create(doc);
    }

    /** Update an agent config and evict its cached runtime agent. */
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

    /** Delete an agent config and evict its cached runtime agent. */
    public static removeAgent(_id: string) {
      invalidateAgentCache(_id);
      return _models.MastraAgent.deleteOne({ _id });
    }
  }

  agentSchema.loadClass(MastraAgent);
  return agentSchema;
};
