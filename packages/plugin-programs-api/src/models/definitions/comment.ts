import { field } from "@erxes/api-utils/src";
import { Document, Schema } from "mongoose";

export interface IComment {
  typeId: string;
  type: string;

  content: string;
  parentId?: string;

  userId?: string;
}

export interface ICommentDocument extends IComment, Document {
  _id: string;
  createdAt?: Date;
}

export const commentSchema = new Schema({
  typeId: field({ type: String, label: "Type Id" }),
  type: field({ type: String, label: "Type" }),

  content: field({ type: String, label: "Content" }),
  parentId: field({ type: String, label: "Parent Id" }),

  userId: field({ type: String, label: "User Id" }),

  createdAt: field({ type: Date, label: "Created at" }),
});
