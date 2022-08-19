import { Document, Schema } from 'mongoose';

export interface INote {
  automationId: string;
  triggerId: string;
  actionId: string;
  description: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: Date;
}

export interface INoteDocument extends INote, Document {
  _id: string;
}

export const noteSchema = new Schema({
  automationId: { type: String },
  triggerId: { type: String },
  actionId: { type: String },
  description: { type: String, required: true },
  updatedBy: { type: String },
  updatedAt: { type: Date },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now(), required: true }
});
