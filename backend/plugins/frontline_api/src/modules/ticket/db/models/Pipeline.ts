import {
  ITicketPipelineDocument,
  ITicketPipeline,
  TicketsPipelineFilter,
} from '@/ticket/@types/pipeline';
import { ticketPipelineSchema } from '@/ticket/db/definitions/pipeline';
import { FlattenMaps, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ITicketPipelineModel extends Model<ITicketPipelineDocument> {
  getPipeline(_id: string): Promise<ITicketPipelineDocument>;
  getPipelines(
    params: TicketsPipelineFilter,
  ): Promise<FlattenMaps<ITicketPipelineDocument>[] | Document[]>;
  addPipeline(doc: ITicketPipeline): Promise<ITicketPipelineDocument>;
  updatePipeline(
    _id: string,
    doc: ITicketPipeline,
  ): Promise<ITicketPipelineDocument | null>;

  removePipeline(_id: string): Promise<{ ok: number }>;
}

export const loadPipelineClass = (models: IModels) => {
  class Pipeline {
    public static async getPipeline(
      _id: string,
    ): Promise<ITicketPipelineDocument> {
      const pipeline = await models.Pipeline.findOne({ _id }).lean();
      if (!pipeline) throw new Error('Pipeline not found');
      return pipeline;
    }

    public static async getPipelines(
      channelId: string,
    ): Promise<ITicketPipelineDocument[]> {
      return models.Pipeline.find({ channelId }).sort({ order: 1 }).lean();
    }

    public static async addPipeline(
      doc: ITicketPipeline,
    ): Promise<ITicketPipelineDocument> {
      return models.Pipeline.create(doc);
    }

    public static async updatePipeline(
      _id: string,
      doc: ITicketPipeline,
    ): Promise<ITicketPipelineDocument | null> {
      return models.Pipeline.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
        { new: true },
      );
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
