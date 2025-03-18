import { field } from "@erxes/api-utils/src";
import { Document, Schema } from "mongoose";

export interface IComment {
  type: string;
  content: string;
  parentId?: string;
}

export interface ICommentDocument extends IComment, Document {
  _id: string;
  createdAt?: Date;
}

export const commentSchema = new Schema({
  contentId: field({ type: String, label: "Content Id" }),
  content: field({ type: String, label: "Content" }),
  parentId: field({ type: String, label: "Parent Id" }),
  createdAt: field({ type: Date, label: "Created at" }),
});
