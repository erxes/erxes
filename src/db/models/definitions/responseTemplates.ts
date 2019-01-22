import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IResponseTemplate {
  name?: string;
  content?: string;
  brandId?: string;
  files?: string[];
}

export interface IResponseTemplateDocument extends IResponseTemplate, Document {
  _id: string;
}

export const responseTemplateSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  content: field({ type: String }),
  brandId: field({ type: String }),
  files: field({ type: Array })
});
