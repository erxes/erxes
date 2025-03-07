import { Document, Schema } from "mongoose";
import { ACTIVITY_SELECT_OPTIONS } from "./constants";
import { field } from "./utils";

const getEnum = (fieldName: string): string[] => {
  return ACTIVITY_SELECT_OPTIONS[fieldName].map((option) => option.value);
};

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
  studyMode?: string;
  attachment?: any;
  status?: string;
  startDate: Date;
  endDate: Date;
  finishDate: Date;
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
  studyMode: field({ type: String, optional: true, label: "Study Mode" }),
  attachment: field({
    type: attachmentSchema,
    optional: true,
    label: "Attachment",
  }),
  status: field({
    type: String,
    enum: getEnum("STATUSES"),
    default: "Open",
    optional: true,
    label: "Status",
    esType: "keyword",
    selectOptions: ACTIVITY_SELECT_OPTIONS.STATUSES,
    index: true,
  }),
});
