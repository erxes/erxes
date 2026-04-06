import { Schema } from 'mongoose';

export const regionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    countries: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);
