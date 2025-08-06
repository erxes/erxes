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
  forType: field({ type: String, required: true }),
  userId: field({ type: String }),
});
