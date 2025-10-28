import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const productGroupSchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },
  modifiedBy: { type: String, label: 'Modified User' },

  mainProductId: { type: String, label: 'Main Product', unique: true },
  subProductId: { type: String, label: 'Sub Product' },
  sortNum: { type: Number, label: 'Sort Number', default: 1 },
  ratio: { type: Number, label: 'ratio', optional: true },
  isActive: { type: Boolean, label: 'isActive' },
});
