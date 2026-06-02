import { Schema } from 'mongoose';

export const statusSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    color: { type: String, label: 'Color', required: true },
    type: { type: Number, label: 'Type', required: true },
    teamId: { type: String, label: 'Team ID', required: true },
    order: { type: Number, label: 'Order', required: true },
  },
  {
    timestamps: true,
  },
);
