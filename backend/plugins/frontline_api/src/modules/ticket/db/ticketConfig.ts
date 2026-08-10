import { Schema, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITicketConfigDocument } from '@/ticket/@types/ticketConfig';

// ─── Schema ───────────────────────────────────────────────────────────────────

const TicketFormFieldSchema = new Schema(
  {
    isShow:      { type: Boolean },
    label:       { type: String },
    placeholder: { type: String },
    order:       { type: Number },
  },
  { _id: false },
);

const TicketConfigSchema = new Schema(
  {
    name:             { type: String, required: true },
    pipelineId:       { type: String, index: true },
    channelId:        { type: String },
    selectedStatusId: { type: String },
    parentId:         { type: String },
    formFields: {
      name:        { type: TicketFormFieldSchema },
      description: { type: TicketFormFieldSchema },
      attachment:  { type: TicketFormFieldSchema },
      tags:        { type: TicketFormFieldSchema },
    },
  },
  { timestamps: true },
);

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ITicketConfigModel extends Model<ITicketConfigDocument> {
  getTicketConfig(_id: string): Promise<ITicketConfigDocument>;
}

export const loadTicketConfigClass = (models: IModels) => {
  class TicketConfig {
    public static async getTicketConfig(_id: string): Promise<ITicketConfigDocument> {
      const ticketConfig = await models.TicketConfig.findOne({ _id });
      if (!ticketConfig) throw new Error('Ticket config not found');
      return ticketConfig;
    }
  }

  TicketConfigSchema.loadClass(TicketConfig);
  return TicketConfigSchema;
};
