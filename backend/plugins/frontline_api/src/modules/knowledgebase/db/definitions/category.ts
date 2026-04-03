import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const categorySchema = new Schema(
  {
    _id: mongooseStringRandomId,
    description: { type: String }, 
    articleIds: { type: [String], required: true },
    icon: { type: String }, 
    parentCategoryId: { type: String }, 
    topicId: { type: String }, 

    createdBy: { type: String }, 
    modifiedBy: { type: String }, 
    modifiedDate: { type: Date }, 
    title: { type: String, required: true },
    code: { type: String }, 
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ code: 1 }, { unique: true, sparse: true });