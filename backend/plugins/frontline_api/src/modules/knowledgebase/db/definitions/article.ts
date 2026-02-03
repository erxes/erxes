import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';

const formcodesSchema = new Schema(
  {
    brandId: { type: String },
    formId: { type: String },
  },
  { _id: false },
);

export const articleSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    summary: { type: String }, 
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'publish', 'scheduled', 'archived'],
      default: 'draft',
      required: true,
    },
    scheduledDate: { type: Date }, 
    isPrivate: {
      type: Boolean,
      default: false,
    },
    reactionChoices: {
      type: [String],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    image: { type: attachmentSchema }, 
    attachments: { type: [attachmentSchema] }, 
    reactionCounts: { type: Object }, 
    topicId: { type: String }, 
    categoryId: { type: String }, 
    publishedUserId: { type: String }, 
    publishedAt: { type: Date }, 
    forms: { type: [formcodesSchema] }, 
    pdfAttachment: { type: Object }, 
    
    // Common fields
    createdBy: { type: String }, 
    modifiedBy: { type: String }, 
    title: { type: String, required: true },
    code: { type: String },
    createdDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

articleSchema.index({ code: 1 }, { unique: true, sparse: true });