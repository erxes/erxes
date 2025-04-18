import { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./utils";

export interface ITmsBranch {
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  user1Ids?: string[];
  user2Ids?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken: string;
  token: string;
  uiOptions?: any;
  permissionConfig?: any;
  status: string;
  pipelineConfig: any;
  extraProductCategories?: string[];
  roomCategories?: string[];
  time?: string;
  discount?: any;

  checkintime?: string;
  checkouttime?: string;
  checkinamount?: number;
  checkoutamount?: number;
}
export interface ITmsBranchDocument extends ITmsBranch, Document {
  _id: string;
}

export const tmsBranchSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    description: field({ type: String, label: "Description", optional: true }),
    userId: field({ type: String, optional: true, label: "Created by" }),
    createdAt: field({ type: Date, label: "Created at" }),
    user1Ids: field({ type: [String], label: " user ids" }),
    user2Ids: field({ type: [String], label: " user ids" }),
    user3Ids: field({ type: [String], label: " user ids" }),
    user4Ids: field({ type: [String], label: " user ids" }),
    user5Ids: field({ type: [String], label: " user ids" }),

    paymentIds: field({ type: [String], label: "Online Payments" }),
    paymentTypes: field({ type: [Object], label: "Other Payments" }),
    token: field({ type: String, label: " token" }),
    uiOptions: field({ type: Object, label: "UI Options" }),
    pipelineConfig: field({ type: Object, label: "UI Options" }),
    erxesAppToken: field({ type: String, label: "Erxes App token" }),
    permissionConfig: field({
      type: Object,
      optional: true,
      label: "Permission",
    }),
    status: field({ type: String, label: "Status", optional: true }),
    time: field({ type: String, label: "time", optional: true }),
    discount: field({ type: Object, label: "object", optional: true }),
    extraProductCategories: field({
      type: [String],
      label: " extraProductCategories ids",
    }),
    roomCategories: field({ type: [String], label: " roomCategories ids" }),
    checkintime: field({ type: String, label: "checkintime" }),
    checkouttime: field({ type: String, label: "checkouttime" }),
    checkinamount: field({ type: Number, label: "checkinamount" }),
    checkoutamount: field({ type: Number, label: "checkoutamount" }),
  }),
  "pms_branch"
);
