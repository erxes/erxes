import { Schema } from 'mongoose';
import { COMPAIGN_STATUS } from './Constants';

export const attachmentSchema = new Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number
  },
  { _id: false }
);

export const commonCompaignSchema = {
  _id: { pkey: true },

  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' },
  modifiedAt: { type: Date, label: 'Modified at' },
  modifiedBy: { type: String, label: 'Modified by' },

  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  startDate: { type: Date, label: 'Start Date' },
  endDate: { type: Date, label: 'End Date' },
  attachment: { type: attachmentSchema },

  status: { type: String, enum: COMPAIGN_STATUS.ALL, default: 'active' }
};

export const validCompaign = (doc) => {
  if (!doc.startDate || doc.startDate < new Date()) {
    throw new Error('The start date must be in the future')
  }

  if (doc.endDate && doc.startDate > doc.endDate) {
    throw new Error('The end date must be after from start date')
  }
}