import { Document, Schema } from "mongoose";
import { field } from "../utils";
import { TAG_TYPES } from "./constants";

export interface ITag {
  name: string;
  type: string;
  colorCode?: string;
  objectCount?: number;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  createdAt: Date;
}

export const tagSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  type: field({
    type: String,
    enum: TAG_TYPES.ALL
  }),
  colorCode: field({ type: String }),
  createdAt: field({ type: Date }),
  objectCount: field({ type: Number })
});
