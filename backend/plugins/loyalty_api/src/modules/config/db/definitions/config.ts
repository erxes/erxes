import { Schema } from 'mongoose';

export const loyaltyConfigSchema = new Schema(
  {
    _id: {
      type: String,
    },

    code: {
      type: String,
      unique: true,
      required: true,
    },

    value: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: false,
  },
);
