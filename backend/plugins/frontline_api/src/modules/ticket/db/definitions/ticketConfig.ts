import { Schema } from 'mongoose';

const TicketBasicFieldsSchema = new Schema(
  {
    isShowName: { type: Boolean, default: true },
    isShowDescription: { type: Boolean, default: true },
    isShowAttachment: { type: Boolean, default: true },
    isShowTags: { type: Boolean, default: true },
  },
  { _id: false },
);

const CompanyFieldsSchema = new Schema(
  {
    isShowName: { type: Boolean, default: false },
    isShowRegistrationNumber: { type: Boolean, default: false },
    isShowAddress: { type: Boolean, default: false },
    isShowPhoneNumber: { type: Boolean, default: false },
    isShowEmail: { type: Boolean, default: false },
  },
  { _id: false },
);

const CustomerFieldsSchema = new Schema(
  {
    isShowFirstName: { type: Boolean, default: false },
    isShowLastName: { type: Boolean, default: false },
    isShowPhoneNumber: { type: Boolean, default: false },
    isShowEmail: { type: Boolean, default: false },
  },
  { _id: false },
);

export const TicketConfigSchema = new Schema(
  {
    name: { type: String, required: true },
    pipelineId: { type: String, index: true },
    channelId: { type: String },
    selectedStatusId: { type: String },

    contactType: {
      type: String,
      enum: ['customer', 'company'],
      required: true,
      default: 'customer',
    },

    ticketBasicFields: TicketBasicFieldsSchema,

    company: CompanyFieldsSchema,
    customer: CustomerFieldsSchema,
  },
  {
    timestamps: true,
  },
);
