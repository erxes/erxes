import { Document, Schema } from "mongoose";

import { field } from "./utils";

export interface ILogDoc {
  createdAt: Date;
  createdBy: string;
  type: string;
  ipAddress?: string;
  action: string;
  object?: string;
  unicode?: string;
  description?: string;
  oldData?: string;
  newData?: string;
  objectId?: string;
  addedData?: string;
  changedData?: string;
  unchangedData?: string;
  removedData?: string;
  extraDesc?: string;
}

export interface ILogDocument extends ILogDoc, Document {}

export const logsSchema = new Schema({
  createdAt: field({
    type: Date,
    label: "Created date",
    index: true,
    default: new Date()
  }),
  createdBy: field({ type: String, label: "Performer of the action" }),
  type: field({
    type: String,
    label: "Service & module name which has been changed, i.e sales:deal"
  }),
  action: field({
    type: String,
    label: "Action, one of (create|update|delete)"
  }),
  ipAddress: field({ type: String, optional: true, label: "IP address" }),
  objectId: field({ type: String, index: true, label: "Collection row id" }),
  unicode: field({ type: String, label: "Performer username" }),
  description: field({
    type: String,
    label: "Description",
    index: true,
    optional: true,
    default: ""
  }),
  // restore db from these if disaster happens
  oldData: field({
    type: String,
    label: "Data before changes",
    optional: true
  }),
  newData: field({ type: String, label: "Data to be changed", optional: true }),
  // processed data to show in front side
  addedData: field({
    type: String,
    label: "Newly added fields",
    optional: true
  }),
  unchangedData: field({
    type: String,
    label: "Unchanged fields",
    optional: true
  }),
  changedData: field({ type: String, label: "Changed fields", optional: true }),
  removedData: field({ type: String, label: "Removed fields", optional: true }),
  extraDesc: field({
    type: String,
    label: "Extra description",
    optional: true
  })
});

logsSchema.index({ type: 1, action: 1, createdBy: 1 });
