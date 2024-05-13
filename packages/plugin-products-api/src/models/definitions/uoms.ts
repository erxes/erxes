import { Schema, Document } from "mongoose";

import { field, schemaWrapper } from "./utils";

export interface IUom {
  code: string;
  name: string;
}

export interface IUomDocument extends IUom, Document {
  _id: string;
  createdAt: Date;
}

const subscriptionConfigSchema = new Schema({
  period: field({ type: String, label: "Subscription Period`" }),
  rule: field({ type: String, label: "Subscription Rule" }),
  specificDay: field({
    type: String,
    label: "Subscription Start Day",
    optional: true,
  }),
});

export const uomSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    code: field({ type: String, unique: true, label: "Code" }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: "Created at",
    }),
    isForSubscription: field({
      type: Boolean,
      optional: true,
      label: "Uom for subscription",
    }),
    subscriptionConfig: field({
      type: subscriptionConfigSchema,
      optional: true,
      label: "Subscription configuration",
    }),
  })
);
