import { Model, Schema, Document } from 'mongoose';
import * as Random from 'meteor-random';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface IAttachmentParams {
  data: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IEmailDeliveries {
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: IAttachmentParams[];
  from: string;
  kind: string;
  userId?: string;
  customerId?: string;
  status?: string;
}

export interface IEmailDeliveriesDocument extends IEmailDeliveries, Document {
  id: string;
}

export interface IEmailDeliveryModel extends Model<IEmailDeliveriesDocument> {
  createEmailDelivery(doc: IEmailDeliveries): Promise<IEmailDeliveriesDocument>;
  updateEmailDeliveryStatus(_id: string, status: string): Promise<void>;
}


export const EMAIL_DELIVERY_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  ALL: ['pending', 'received']
};

const schema = new Schema({
  _id: { type: String, default: () => Random.id() },
  subject: field({ type: String }),
  body: field({ type: String }),
  to: field({ type: [String] }),
  cc: field({ type: [String], optional: true }),
  bcc: field({ type: [String], optional: true }),
  attachments: field({ type: [Object] }),
  from: field({ type: String }),
  kind: field({ type: String }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  status: field({
    type: String,
    enum: EMAIL_DELIVERY_STATUS.ALL
  })
});

export const loadEmailDeliveryClass = (models: IModels) => {
  class EmailDelivery {
    /**
     * Create an EmailDelivery document
     */
    public static async createEmailDelivery(doc: IEmailDeliveries) {
      return models.EmailDeliveries.create({
        ...doc
      });
    }

    public static async updateEmailDeliveryStatus(_id: string, status: string) {
      return models.EmailDeliveries.updateOne({ _id }, { $set: { status } });
    }
  }

  schema.loadClass(EmailDelivery);

  return schema;
};
