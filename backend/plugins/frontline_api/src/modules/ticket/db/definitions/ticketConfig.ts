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

const TicketPropertyFieldOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const TicketPropertyFieldSchema = new Schema(
  {
    fieldId: { type: String, required: true },
    groupId: { type: String, required: false },
    label: { type: String, required: false },
    placeholder: { type: String, required: false },
    order: { type: Number, required: false },
    isRequired: { type: Boolean, required: false },
    type: { type: String, required: false },
    options: { type: [TicketPropertyFieldOptionSchema], default: [] },
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

    propertyFields: { type: [TicketPropertyFieldSchema], default: [] },
  },
  {
    timestamps: true,
  },
);
