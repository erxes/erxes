import { Schema } from 'mongoose';
import { STATUS_TYPES } from '@/status/constants/types';

export const triageSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    createdBy: { type: String, label: 'Created By' },
    type: { type: String, label: 'Type' },
    number: { type: Number, label: 'Number', default: 0 },
    priority: { type: Number, label: 'Priority', default: 0 },
    status: { type: Number, label: 'Status', default: STATUS_TYPES.TRIAGE },
  },
  {
    timestamps: true,
  },
);
