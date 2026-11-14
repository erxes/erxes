import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

// One tile on a user's home dashboard; x/y/w/h are grid units, not pixels.
export interface IDashboardLayoutItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: Record<string, unknown>;
}

export interface IDashboardLayout {
  userId: string;
  items: IDashboardLayoutItem[];
}

export interface IDashboardLayoutDocument extends IDashboardLayout, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const dashboardLayoutItemSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    config: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: false },
);

export const dashboardLayoutSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    userId: { type: String, required: true },
    items: { type: [dashboardLayoutItemSchema], default: [] },
  },
  { timestamps: true },
);

dashboardLayoutSchema.index({ userId: 1 }, { unique: true });
