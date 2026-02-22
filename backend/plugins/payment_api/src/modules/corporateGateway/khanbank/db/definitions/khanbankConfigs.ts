import { Schema } from 'mongoose';

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
  },
);
