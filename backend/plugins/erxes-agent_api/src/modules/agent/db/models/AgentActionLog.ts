import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { agentActionLogSchema } from '@/agent/db/definitions/agentActionLog';
import {
  IMastraAgentActionLog,
  IMastraAgentActionLogDocument,
} from '@/agent/@types/agentActionLog';

export interface IMastraAgentActionLogListParams {
  agentId?: string;
  source?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export interface IMastraAgentActionLogModel extends Model<IMastraAgentActionLogDocument> {
  record(doc: IMastraAgentActionLog): Promise<IMastraAgentActionLogDocument>;
  getActions(
    params: IMastraAgentActionLogListParams,
  ): Promise<IMastraAgentActionLogDocument[]>;
}

/** Bind the MastraAgentActionLog statics onto the schema (mongoose loadClass). */
export const loadAgentActionLogClass = (_models: IModels) => {
  /** Static helpers for the agent action audit trail. */
  // skipcq: JS-0327 — the mongoose loadClass pattern requires a class of statics
  class MastraAgentActionLog {
    /** Append one action entry to the audit trail. */
    public static record(doc: IMastraAgentActionLog) {
      return _models.MastraAgentActionLog.create(doc);
    }

    /** Recorded actions, newest first, optionally filtered and paginated. */
    public static getActions({
      agentId,
      source,
      status,
      page = 1,
      perPage = 30,
    }: IMastraAgentActionLogListParams) {
      const filter: Record<string, unknown> = {};
      if (agentId) filter.agentId = agentId;
      if (source) filter.source = source;
      if (status) filter.status = status;

      const limit = Math.min(Math.max(perPage, 1), 100);
      const skip = (Math.max(page, 1) - 1) * limit;

      return _models.MastraAgentActionLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
  }

  agentActionLogSchema.loadClass(MastraAgentActionLog);
  return agentActionLogSchema;
};
