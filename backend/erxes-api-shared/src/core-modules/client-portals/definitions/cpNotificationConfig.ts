import { Schema, Document } from 'mongoose';
import { mongooseStringRandomId } from '../../../utils';

export interface ICPNotificationConfigDocument extends Document {
  _id: string;
  clientPortalId: string;
  eventType: string;
  inAppEnabled: boolean;
  firebaseEnabled: boolean;
  template?: {
    title?: string;
    message?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationTemplateSchema = new Schema(
  {
    title: { type: String },
    message: { type: String },
  },
  { _id: false },
);

export const cpNotificationConfigSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    clientPortalId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    inAppEnabled: {
      type: Boolean,
      default: true,
    },
    firebaseEnabled: {
      type: Boolean,
      default: false,
    },
    template: {
      type: notificationTemplateSchema,
    },
  },
  { timestamps: true },
);

cpNotificationConfigSchema.index({ clientPortalId: 1, eventType: 1 }, { unique: true });
