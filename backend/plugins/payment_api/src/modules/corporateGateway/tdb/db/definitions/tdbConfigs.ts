import { Schema } from 'mongoose';

export const tdbConfigSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },

    apiUrl: {
      type: String,
      required: true,
      default: 'https://api-sandbox.tdbmlabs.mn:8443',
    },

    clientId: {
      type: String,
      required: true,
    },

    clientSecret: {
      type: String,
      required: true,
    },

    testMode: { type: Boolean, default: true },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.clientSecret;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.clientSecret;
        return ret;
      },
    },
  },
);
