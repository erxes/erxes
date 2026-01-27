import { Document, Schema } from 'mongoose';

export interface IKhanbankConfig {
  name: string;
  description?: string;

  // khanbank
  consumerKey: string;
  secretKey: string;
}

export interface IKhanbankConfigDocument extends IKhanbankConfig, Document {
  _id: string;
  createdAt: Date;
}

export const khanbankConfigSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },

    // khanbank
    consumerKey: { type: String, required: true },
    secretKey: { type: String, required: true },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.secretKey;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.secretKey;
        return ret;
      },
    },
  }
);
