import { Schema, Model } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IStatus, IStatusDocument } from '@/ticket/@types/status';
import { generateDefaultStatuses } from '@/ticket/utils/ticket';

// ─── Schema ───────────────────────────────────────────────────────────────────

const statusSchema = new Schema(
  {
    _id:              mongooseStringRandomId,
    name:             { type: String, required: true },
    description:      { type: String },
    pipelineId:       { type: String, required: true, index: true },
    color:            { type: String, default: '#4F46E5' },
    type:             { type: Number, required: true },
    order:            { type: Number, required: true },
    visibilityType:   { type: String },
    memberIds:        [{ type: String }],
    canMoveMemberIds: [{ type: String }],
    canEditMemberIds: [{ type: String }],
    departmentIds:    [{ type: String }],
    state:            { type: String },
    probability:      { type: Number },
  },
  { timestamps: true },
);

// ─── Model ────────────────────────────────────────────────────────────────────

export interface IStatusModel extends Model<IStatusDocument> {
  getStatus(_id: string): Promise<IStatusDocument>;
  getStatuses(pipelineId: string, type?: number): Promise<IStatusDocument[]>;
  addStatus(doc: IStatus): Promise<IStatusDocument>;
  createDefaultStatuses(pipelineId: string): Promise<IStatusDocument[]>;
  updateStatus(_id: string, doc: IStatus): Promise<IStatusDocument | null>;
  removeStatus(_id: string): Promise<{ ok: number }>;
}

export const loadStatusClass = (models: IModels) => {
  class Status {
    public static async getStatus(_id: string): Promise<IStatusDocument> {
      const status = await models.Status.findOne({ _id }).lean();
      if (!status) throw new Error('Status not found');
      return status;
    }

    public static async getStatuses(
      pipelineId: string,
      type?: number,
    ): Promise<IStatusDocument[]> {
      const query: any = { pipelineId };
      if (type) query.type = type;
      return models.Status.find(query).sort({ order: 1 });
    }

    public static async addStatus(doc: IStatus): Promise<IStatusDocument> {
      const lastStatus = await models.Status.findOne({
        pipelineId: doc.pipelineId,
        type: doc.type,
      }).sort({ order: -1 });

      doc.order = lastStatus ? lastStatus.order + 1 : 1;
      return models.Status.create(doc);
    }

    public static async createDefaultStatuses(
      pipelineId: string,
    ): Promise<IStatusDocument[]> {
      const statuses = generateDefaultStatuses(pipelineId);
      return models.Status.create(statuses);
    }

    public static async updateStatus(
      _id: string,
      doc: IStatus,
    ): Promise<IStatusDocument | null> {
      return models.Status.findOneAndUpdate({ _id }, { $set: { ...doc } }, { new: true });
    }

    public static async removeStatus(_id: string): Promise<{ ok: number }> {
      const result = await models.Status.deleteOne({ _id });
      return { ok: result.deletedCount || 0 };
    }
  }

  statusSchema.loadClass(Status);
  return statusSchema;
};
