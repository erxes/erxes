import { Document, Schema } from "mongoose";
import { field } from "./utils";

export interface IContactLabel {
  name: string;
  forType: string;
  userId?: string;
}

export interface IContactLabelDocument extends IContactLabel, Document {
  _id: string;
}

export const contactLabelSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, required: true }),
  forType: field({ type: String, required: true, enum: ["phone", "email"] }),
  userId: field({ type: String }),
});

contactLabelSchema.index({ name: 1, forType: 1, userId: 1 }, { unique: true });
contactLabelSchema.index({ forType: 1, userId: 1 });
