import { Document, Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export interface IChangemoduleItem {
  name: string;
  code: string;
  status: string;
}

export interface IChangemoduleItemDocument
  extends IChangemoduleItem,
    Document<string> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const changemoduleItemSchema = new Schema<IChangemoduleItemDocument>(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    code: { type: String, required: true, unique: true, label: 'Code' },
    status: { type: String, default: 'active', label: 'Status' },
  },
  { timestamps: true },
);
