import { Schema } from 'mongoose';

export const triageSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    createdBy: { type: String, label: 'Created By' },
    type: { type: String, label: 'Type' },
    number: { type: Number, label: 'Number', default: 0 },
    priority: { type: Number, label: 'Priority', default: 0 },
  },
  {
    timestamps: true,
  },
);
