import { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./utils";

export interface IBmsBranch {
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
}
export interface IBmsBranchDocument extends IBmsBranch, Document {
  _id: string;
}

export const bmsBranchSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    description: field({ type: String, label: "Description", optional: true }),
    userId: field({ type: String, optional: true, label: "Created by" }),
    createdAt: field({ type: Date, label: "Created at" }),
    user1Ids: field({ type: [String], label: "general manager user ids" }),
    user2Ids: field({ type: [String], label: "manager user ids" }),
    paymentIds: field({ type: [String], label: "Online Payments" }),
    paymentTypes: field({ type: [Object], label: "Other Payments" }),
    token: field({ type: String, label: " token" }),
    uiOptions: field({ type: Object, label: "UI Options" }),
    erxesAppToken: field({ type: String, label: "Erxes App token" }),
    permissionConfig: field({
      type: Object,
      optional: true,
      label: "Permission"
    }),
    status: field({ type: String, label: "Status", optional: true })
  }),
  "bms_branch"
);
