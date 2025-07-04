import { Document, Schema } from "mongoose";
import { field } from "./utils";

export interface ILabel {
  name: string;
  forType: string;
  userId: string;
}

export interface ILabelDocument extends ILabel, Document {
  _id: string;
}

export const labelSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, required: true }),
  forType: field({ type: String, required: true }),
  userId: field({ type: String }),
});
