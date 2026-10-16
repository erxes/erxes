import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { SALES_STATUSES } from '../../constants';

export const boardSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name' },
    status: {
      type: String,
      enum: SALES_STATUSES.ALL,
      default: SALES_STATUSES.ACTIVE,
      index: true,
      label: 'Status',
    },
    userId: { type: String, label: 'Created by' },
    archiveInProgress: { type: Boolean, default: false },
    order: { type: Number, label: 'Order' },
    type: {
      type: String,
      required: true,
      label: 'Type',
      default: 'deal',
    },
  },
  {
    timestamps: true,
  },
);
