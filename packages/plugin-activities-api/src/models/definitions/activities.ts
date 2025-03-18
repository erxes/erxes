import { Document, Schema } from "mongoose";
import {
  ATTENDANCE_TYPES,
  ACTIVITY_STATUSES,
  ACTIVITY_TYPES,
} from "./constants";
import { field } from "./utils";

const attachmentSchema = new Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number,
  },
  { _id: false }
);

export interface IActivity {
  name: string;
  code?: string;
  categoryId: string;
  category: IActivityCategory;
  description?: string;
  createdAt?: Date;
  type?: string;
  attachment?: any;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  unitPrice: number;
}

export interface IActivityDocument extends IActivity, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  searchText: string;
}

export interface IActivityCategory {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  code: string;
  isRoot?: boolean;
  activityCount?: number;
  attachment?: any;
}

export interface IActivityCategoryDocument extends IActivityCategory, Document {
  _id: string;
  order?: string;
  createdAt: Date;
}

export const activityCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: "Name" }),
  code: field({ type: String, unique: true, label: "Code" }),
  order: field({ type: String, label: "Order" }),
  parentId: field({ type: String, optional: true, label: "Parent ID" }),
  description: field({ type: String, optional: true, label: "Description" }),
  isRoot: field({ type: Boolean, optional: true, label: "Is Root" }),
  activityCount: field({
    type: Number,
    optional: true,
    label: "Activity Count",
  }),
  attachment: field({
    type: attachmentSchema,
    optional: true,
    label: "Image",
  }),
});

export const activitySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: "Name" }),
  code: field({ type: String, unique: true, label: "Code" }),
  categoryId: field({ type: String, optional: true, label: "Category ID" }),
  category: field({ type: Object, optional: true, label: "Category" }),
  description: field({ type: String, optional: true, label: "Description" }),
  createdAt: field({ type: Date, default: new Date(), label: "Created At" }),
  type: field({
    type: String,
    enum: ACTIVITY_TYPES.ALL,
    default: ACTIVITY_TYPES.ACTIVITY,
    optional: true,
    label: "Type",
  }),
  attachment: field({
    type: attachmentSchema,
    optional: true,
    label: "Attachment",
  }),

  searchText: field({ type: String, optional: true, index: true }),
  status: field({
    type: String,
    enum: ACTIVITY_STATUSES.ALL,
    default: ACTIVITY_STATUSES.DRAFT,
    optional: true,
    label: "Status",
  }),
  startDate: field({ type: Date, label: "Start Date" }),
  endDate: field({ type: Date, label: "End Date" }),
  deadline: field({ type: Date, label: "Use Finsh Date" }),
  unitPrice: field({ type: Number, optional: true, label: "Unit price" }),
});
