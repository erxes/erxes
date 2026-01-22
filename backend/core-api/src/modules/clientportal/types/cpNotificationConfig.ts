import { Document } from 'mongoose';

export interface ICPNotificationConfig {
  _id?: string;
  clientPortalId: string;
  eventType: string;
  inAppEnabled: boolean;
  firebaseEnabled: boolean;
  template?: {
    title?: string;
    message?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICPNotificationConfigDocument
  extends ICPNotificationConfig,
    Document {
  _id: string;
}
