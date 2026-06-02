import { Schema, FlattenMaps, Model } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  ITicketPipeline,
  ITicketPipelineDocument,
  TicketsPipelineFilter,
} from '@/ticket/@types/pipeline';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';

// ─── Schema ───────────────────────────────────────────────────────────────────

const ticketPipelineSchema = new Schema(
  {
    _id:                  mongooseStringRandomId,
    name:                 { type: String, required: true },
    userId:               { type: String },
    description:          { type: String },
    channelId:            { type: String, ref: 'channels', required: true, index: true },
    order:                { type: Number, default: 0 },
    state:                { type: String },
    isCheckDate:          { type: Boolean },
    isCheckUser:          { type: Boolean },
    isCheckDepartment:    { type: Boolean },
    isCheckBranch:        { type: Boolean },
    isHideName:           { type: Boolean },
    excludeCheckUserIds:  [{ type: String }],
    numberConfig:         { type: String },
    numberSize:           { type: String },
    nameConfig:           { type: String },
    lastNum:              { type: String },
    departmentIds:        [{ type: String }],
    branchIds:            [{ type: String }],
    tagId:                { type: String },
    visibility:           { type: String },
    memberIds:            [{ type: String }],
  },
  { timestamps: true },
);

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ITicketPipelineModel extends Model<ITicketPipelineDocument> {
  getPipeline(_id: string): Promise<ITicketPipelineDocument>;
  getPipelines(params: TicketsPipelineFilter): Promise<FlattenMaps<ITicketPipelineDocument>[]>;
  addPipeline(doc: ITicketPipeline): Promise<ITicketPipelineDocument>;
  updatePipeline(_id: string, doc: ITicketPipeline, user?: IUserDocument): Promise<ITicketPipelineDocument | null>;
  removePipeline(_id: string): Promise<{ ok: number }>;
}

export const loadPipelineClass = (models: IModels) => {
  class Pipeline {
    public static async getPipeline(_id: string): Promise<ITicketPipelineDocument> {
      const pipeline = await models.Pipeline.findOne({ _id }).lean();
      if (!pipeline) throw new Error('Pipeline not found');
      return pipeline;
    }

    public static async getPipelines(channelId: string): Promise<ITicketPipelineDocument[]> {
      return models.Pipeline.find({ channelId }).sort({ order: 1 }).lean();
    }

    public static async addPipeline(doc: ITicketPipeline): Promise<ITicketPipelineDocument> {
      const pipeline = await models.Pipeline.create(doc);
      await models.Status.createDefaultStatuses(pipeline._id);
      return pipeline;
    }

    public static async updatePipeline(
      _id: string,
      doc: ITicketPipeline,
      user?: IUserDocument,
    ): Promise<ITicketPipelineDocument | null> {
      const permissionValidator = createPermissionValidator(models);
      if (doc.statusId) {
        await permissionValidator.validateMovePermission(doc.statusId, user);
      }
      return models.Pipeline.findOneAndUpdate({ _id }, { $set: { ...doc } }, { new: true });
    }

    public static async removePipeline(_id: string): Promise<{ ok: number }> {
      const ticket = await models.Ticket.findOne({ pipelineId: _id });
      if (ticket) throw new Error('Pipeline is used by ticket');
      const result = await models.Pipeline.deleteOne({ _id });
      return { ok: result.deletedCount || 0 };
    }
  }

  ticketPipelineSchema.loadClass(Pipeline);
  return ticketPipelineSchema;
};
