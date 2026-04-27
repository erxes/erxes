import { Schema } from 'mongoose';

const TicketFormFieldSchema = new Schema(
  {
    isShow: { type: Boolean, required: false },
    label: { type: String, required: false },
    placeholder: { type: String, required: false },
    order: { type: Number, required: false },
  },
  { _id: false },
);

export const TicketConfigSchema = new Schema(
  {
    name: { type: String, required: true },
    pipelineId: { type: String, index: true },
    channelId: { type: String },
    selectedStatusId: { type: String },

    parentId: { type: String, required: false },

    formFields: {
      name: { type: TicketFormFieldSchema, required: false },
      description: { type: TicketFormFieldSchema, required: false },
      attachment: { type: TicketFormFieldSchema, required: false },
      tags: { type: TicketFormFieldSchema, required: false },
    },
  },
  {
    timestamps: true,
  },
);
