import { Document } from 'mongoose';

export interface IAdjustment {
  createdBy: string;
  createdAt: Date;
  date: Date;
}

export interface IAdjustmentDocument extends IAdjustment, Document {
  _id: string;
}

export const adjustmentSchema = {
  _id: { pkey: true },
  createdBy: { type: String, label: 'Created By' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },

  date: { type: Date, label: 'Adustment Date' },
};
