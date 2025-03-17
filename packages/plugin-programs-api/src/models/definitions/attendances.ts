import { field } from "@erxes/api-utils/src";
import { Document, Schema } from "mongoose";
import { ATTENDANCE_TYPES } from "./constants";

export interface IAttendances {
  classId: string;
  studentId: string;
  status: string;
  description?: string;
}

export interface IAttendancesDocument extends IAttendances, Document {
  _id: string;
  createdAt?: Date;
  modifiedAt: Date;
}

export const attendancesSchema = new Schema({
  _id: field({ pkey: true }),
  status: field({
    type: String,
    enum: ATTENDANCE_TYPES.ALL,
    default: ATTENDANCE_TYPES.PRESENT,
    optional: true,
    label: "status",
  }),
  class: field({ type: String, optional: true, label: "Class ID" }),
  description: field({ type: String, optional: true, label: "Description" }),
  studentId: field({ type: String, optional: true, label: "Student ID" }),
  createdAt: field({ type: Date, label: "Created at" }),
});
