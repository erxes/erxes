import { Schema } from 'mongoose';

import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const notificationSchema = new Schema({
  _id: mongooseStringRandomId,
  title: { type: String },
  link: { type: String, optional: true },
  content: { type: String },
  createdUser: { type: String },
  receiver: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30, // 30 days
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  notifType: {
    type: String,
  },
  clientPortalId: {
    type: String,
  },
  eventData: {
    type: Schema.Types.Mixed,
    optional: true,
  },
  groupId: {
    type: String,
    optional: true,
  },
});

notificationSchema.index(
  { createdAt: 1, receiver: 1, clientPortalId: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 },
);
