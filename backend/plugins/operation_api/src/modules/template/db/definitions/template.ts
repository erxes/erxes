import { Schema } from 'mongoose';

export const operationTemplateSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    defaults: { type: Object, label: 'Defaults' },
    teamId: { type: String, label: 'Team', required: true },
    createdBy: { type: String, label: 'Created By' },
  },
  {
    timestamps: true,
  },
);
