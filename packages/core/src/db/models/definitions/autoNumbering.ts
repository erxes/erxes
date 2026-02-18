import { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./utils";

export interface IAutoNumbering {
  module: string; // target module: customer, lead, product, etc.
  pattern: string; // e.g. "{PREFIX}-{year}-{number}"
  lastNumber: number; // keeps track of the latest generated number
  fractionalPart?: number; // padding size, default 4 → 0001
  description?: string;
  createdAt?: Date;
}

export interface IAutoNumberingDocument extends IAutoNumbering, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const autoNumberingSchema = schemaHooksWrapper(
  new Schema(
    {
      _id: field({ pkey: true }),
      module: field({
        type: String,
        label: "Module",
        index: true,
        required: true
      }),
      pattern: field({
        type: String,
        label: "Pattern",
        required: true
      }),
      lastNumber: field({
        type: Number,
        label: "Last number",
        default: 0
      }),
      fractionalPart: field({
        type: Number,
        label: "Fractional part (padding)",
        default: 4
      }),
      description: field({
        type: String,
        label: "Description",
        optional: true
      }),
      createdAt: field({
        type: Date,
        label: "Created at",
        default: Date.now
      }),
      updatedAt: field({
        type: Date,
        label: "Updated at",
        default: Date.now
      })
    },
    { timestamps: true }
  ),
  "erxes_autoNumberings"
);

// Index to quickly find configs by module
autoNumberingSchema.index({ module: 1 });
