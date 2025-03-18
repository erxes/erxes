import { field } from "@erxes/api-utils/src";
import { Document, Schema } from "mongoose";

export interface IClasses {
  name: string;
  activityId: string;
  dates: string[];
  startTime: Date;
  endTime: Date;
  limit: number;
  entries: number;
}

export interface IClassesDocument extends IClasses, Document {
  _id: string;
  createdAt?: Date;
  modifiedAt: Date;
}

export const classesSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, required: true, label: "Class Name" }),
  activityId: field({ type: String, required: true, label: "Activity ID" }),
  dates: field({ type: Array, required: true, label: "Dates" }),
  startTime: field({ type: Date, label: "Class start time" }),
  endTime: field({ type: Date, label: "Class end time" }),
  limit: field({ type: Number, label: "Limit of students" }),
  entries: field({ type: Number, label: "Class Entries" }),
  createdAt: field({ type: Date, default: new Date(), label: "Created at" }),
  modifiedAt: field({ type: Date, default: new Date(), label: "Modified at" }),
});
