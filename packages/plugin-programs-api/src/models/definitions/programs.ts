import { Document, Schema } from "mongoose";
import { PROGRAM_STATUSES, PROGRAM_TYPES } from "./constants";
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

export interface IProgram {
  name: string;
  code?: string;
  categoryId: string;
  category: IProgramCategory;
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

export interface IProgramDocument extends IProgram, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  searchText: string;
}

export interface IProgramCategory {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  code: string;
  isRoot?: boolean;
  programCount?: number;
  attachment?: any;
}

export interface IProgramCategoryDocument extends IProgramCategory, Document {
  _id: string;
  order?: string;
  createdAt: Date;
}

export const programCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: "Name" }),
  code: field({ type: String, unique: true, label: "Code" }),
  order: field({ type: String, label: "Order" }),
  parentId: field({ type: String, optional: true, label: "Parent ID" }),
  description: field({ type: String, optional: true, label: "Description" }),
  isRoot: field({ type: Boolean, optional: true, label: "Is Root" }),
  programCount: field({
    type: Number,
    optional: true,
    label: "Program Count",
  }),
  attachment: field({
    type: attachmentSchema,
    optional: true,
    label: "Image",
  }),
});

export const programSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: "Name" }),
  code: field({ type: String, unique: true, label: "Code" }),
  categoryId: field({ type: String, optional: true, label: "Category ID" }),
  category: field({ type: Object, optional: true, label: "Category" }),
  description: field({ type: String, optional: true, label: "Description" }),
  createdAt: field({ type: Date, default: new Date(), label: "Created At" }),
  type: field({
    type: String,
    enum: PROGRAM_TYPES.ALL,
    default: PROGRAM_TYPES.ACTIVITY,
    optional: true,
    label: "Type",
  }),
  duration: field({ type: String, label: "Duration" }),
  attachment: field({
    type: attachmentSchema,
    optional: true,
    label: "Attachment",
  }),

  searchText: field({ type: String, optional: true, index: true }),

  status: field({
    type: String,
    enum: PROGRAM_STATUSES.ALL,
    default: PROGRAM_STATUSES.ACTIVE,
    optional: true,
    label: "Status",
  }),
  startDate: field({ type: Date, label: "Start Date" }),
  endDate: field({ type: Date, label: "End Date" }),
  deadline: field({ type: Date, label: "Use Finsh Date" }),
  unitPrice: field({ type: Number, optional: true, label: "Unit price" }),
});
