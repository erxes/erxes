import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { learningSchema } from '@/learning/db/definitions/learning';
import {
  IMastraLearning,
  IMastraLearningDocument,
  MastraLearningStatus,
} from '@/learning/@types/learning';

export interface IMastraLearningFilter {
  status?: MastraLearningStatus;
  type?: string;
  agentId?: string;
  searchValue?: string;
}

export interface IMastraLearningModel extends Model<IMastraLearningDocument> {
  createLearning(
    doc: Partial<IMastraLearning>,
  ): Promise<IMastraLearningDocument>;
  updateLearning(
    _id: string,
    doc: Partial<IMastraLearning>,
  ): Promise<IMastraLearningDocument>;
  // Same lesson re-derived from another conversation: count the evidence,
  // record the (hashed) contributor, keep the higher confidence estimate.
  mergeEvidence(
    _id: string,
    args: { confidence?: number; sourceHash?: string },
  ): Promise<IMastraLearningDocument | null>;
  setStatus(
    _id: string,
    status: MastraLearningStatus,
    reviewedByUserId?: string,
  ): Promise<IMastraLearningDocument>;
  setPinned(_id: string, pinned: boolean): Promise<IMastraLearningDocument>;
  // Feedback reinforcement: shift confidence of the given learnings, clamped
  // to [0, 1]. Positive delta also bumps lastReinforcedAt.
  reinforce(ids: string[], delta: number): Promise<void>;
  listLearnings(
    filter: IMastraLearningFilter,
    page?: number,
    perPage?: number,
  ): Promise<{ list: IMastraLearningDocument[]; totalCount: number }>;
  getStats(): Promise<Record<string, number>>;
}

/** Bind the MastraLearning statics onto the learning schema (mongoose loadClass). */
export const loadLearningClass = (_models: IModels) => {
  /** Static lifecycle helpers for distilled learnings (lessons). */
  // skipcq: JS-0327 — the mongoose loadClass pattern requires a class of statics
  class MastraLearning {
    /** Create a learning with default confidence/evidence seeds. */
    public static createLearning(doc: Partial<IMastraLearning>) {
      return _models.MastraLearning.create({
        confidence: 0.5,
        evidenceCount: 1,
        ...doc,
      });
    }

    /** Update a learning's fields; throws when it does not exist. */
    public static async updateLearning(
      _id: string,
      doc: Partial<IMastraLearning>,
    ) {
      const updated = await _models.MastraLearning.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );
      if (!updated) throw new Error('Learning not found');
      return updated;
    }

    /** Count re-derived evidence and keep the higher confidence estimate. */
    public static mergeEvidence(
      _id: string,
      args: { confidence?: number; sourceHash?: string },
    ) {
      const update: UpdateQuery<IMastraLearningDocument> = {
        $inc: { evidenceCount: 1 },
        $set: { lastReinforcedAt: new Date() },
      };
      if (args.sourceHash) update.$addToSet = { sourceHashes: args.sourceHash };
      if (typeof args.confidence === 'number') {
        update.$max = { confidence: Math.min(1, Math.max(0, args.confidence)) };
      }
      return _models.MastraLearning.findOneAndUpdate({ _id }, update, {
        new: true,
      });
    }

    /** Move a learning through its review lifecycle, stamping the reviewer. */
    public static async setStatus(
      _id: string,
      status: MastraLearningStatus,
      reviewedByUserId?: string,
    ) {
      const set: Partial<IMastraLearning> = { status };
      if (reviewedByUserId) set.reviewedByUserId = reviewedByUserId;
      const updated = await _models.MastraLearning.findOneAndUpdate(
        { _id },
        { $set: set },
        { new: true },
      );
      if (!updated) throw new Error('Learning not found');
      return updated;
    }

    /** Pin or unpin a learning so it always leads the digest. */
    public static async setPinned(_id: string, pinned: boolean) {
      const updated = await _models.MastraLearning.findOneAndUpdate(
        { _id },
        { $set: { pinned } },
        { new: true },
      );
      if (!updated) throw new Error('Learning not found');
      return updated;
    }

    /** Shift the confidence of the given learnings by delta, clamped to [0, 1]. */
    public static async reinforce(ids: string[], delta: number) {
      if (!ids.length || !delta) return;
      const docs = await _models.MastraLearning.find({ _id: { $in: ids } });
      for (const doc of docs) {
        const confidence = Math.min(
          1,
          Math.max(0, (doc.confidence ?? 0.5) + delta),
        );
        const set: Partial<IMastraLearning> = { confidence };
        if (delta > 0) set.lastReinforcedAt = new Date();
        await _models.MastraLearning.updateOne({ _id: doc._id }, { $set: set });
      }
    }

    /** Filtered, paginated learnings list (pinned first, then most recent). */
    public static async listLearnings(
      filter: IMastraLearningFilter,
      page = 1,
      perPage = 20,
    ) {
      const query: FilterQuery<IMastraLearningDocument> = {};
      if (filter.status) query.status = filter.status;
      if (filter.type) query.type = filter.type;
      if (filter.agentId) query.agentId = filter.agentId;
      if (filter.searchValue) {
        query.statement = { $regex: filter.searchValue, $options: 'i' };
      }
      const [list, totalCount] = await Promise.all([
        _models.MastraLearning.find(query)
          .sort({ pinned: -1, updatedAt: -1 })
          .skip((page - 1) * perPage)
          .limit(perPage),
        _models.MastraLearning.countDocuments(query),
      ]);
      return { list, totalCount };
    }

    /** Per-status learning counts for the review dashboard. */
    public static async getStats() {
      const rows = await _models.MastraLearning.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      const stats: Record<string, number> = {
        candidate: 0,
        approved: 0,
        rejected: 0,
        conflict: 0,
        archived: 0,
      };
      for (const row of rows) stats[row._id] = row.count;
      return stats;
    }
  }

  learningSchema.loadClass(MastraLearning);
  return learningSchema;
};
