import { Schema } from 'mongoose';

export const tdbConfigSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },

    // TDB E-Commerce
    apiUrl: {
      type: String,
      required: true,
      default: 'https://acsmc.tdbmlabs.mn:8000/order',
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    testMode: { type: Boolean, default: true },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);
