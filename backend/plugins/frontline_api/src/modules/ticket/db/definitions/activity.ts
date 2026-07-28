import { Schema } from 'mongoose';

const formSubmissionSchema = new Schema(
  {
    label: { type: String, label: 'Label' },
    value: { type: Schema.Types.Mixed, label: 'Value' },
  },
  { _id: false },
);

const metadataSchema = new Schema(
  {
    newValue: { type: String, label: 'New Value' },
    previousValue: { type: String, label: 'Previous Value' },
    conversationId: { type: String, label: 'Conversation ID' },
    ticketId: { type: String, label: 'Ticket ID' },
    formId: { type: String, label: 'Form ID' },
    formTitle: { type: String, label: 'Form Title' },
    submissions: { type: [formSubmissionSchema], label: 'Form Submissions' },
  },
  {
    _id: false,
  },
);

export const activitySchema = new Schema(
  {
    action: { type: String, label: 'Action', required: true },
    contentId: {
      type: String,
      label: 'Content ID',
      required: true,
    },
    module: { type: String, label: 'Module', required: true },
    metadata: { type: metadataSchema, label: 'Metadata' },
    createdBy: { type: String, label: 'Created By' },
  },
  {
    timestamps: true,
  },
);
