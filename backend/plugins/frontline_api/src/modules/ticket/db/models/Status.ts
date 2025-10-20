import { IStatusDocument, IStatus } from '@/ticket/@types/status';
import { statusSchema } from '@/ticket/db/definitions/status';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { generateDefaultStatuses } from '@/ticket/utils';

export interface IStatusModel extends Model<IStatusDocument> {
  getStatus(_id: string): Promise<IStatusDocument>;
  getStatuses(pipelineId: string, type?: number): Promise<IStatusDocument[]>;
  addStatus(doc: IStatus): Promise<IStatusDocument>;
  createDefaultStatuses(pipelineId: string): Promise<IStatusDocument[]>;
  updateStatus(_id: string, doc: IStatus): Promise<IStatusDocument>;
  removeStatus(_id: string): Promise<{ ok: number }>;
}

export const loadStatusClass = (models: IModels) => {
  class Status {
    public static async getStatus(_id: string) {
      const Status = await models.Status.findOne({ _id }).lean();

      if (!Status) {
        throw new Error('Status not found');
      }

      return Status;
    }

    public static async getStatuses(
      pipelineId: string,
      type: number,
    ): Promise<IStatusDocument[]> {
      const query = { pipelineId } as any;

      if (type) {
        query.type = type;
      }

      return await models.Status.find(query).sort({ order: 1 });
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

      return models.Status.insertMany(statuses);
    }

    public static async updateStatus(_id: string, doc: IStatus) {
      return await models.Status.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
        { new: true },
      );
    }

    public static async removeStatus(_id: string) {
      return models.Status.deleteOne({ _id });
    }
  }

  statusSchema.loadClass(Status);

  return statusSchema;
};
