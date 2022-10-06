import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IStats {
  open: number;
  click: number;
  complaint: number;
  delivery: number;
  bounce: number;
  reject: number;
  send: number;
  renderingfailure: number;
  total: number;
  engageMessageId: string;
}

export interface IStatsDocument extends IStats, Document {}

export const statsSchema = new Schema({
  engageMessageId: {
    type: String,
    label: 'Engage message id at erxes-api',
    unique: true
  },
  createdAt: { type: Date, default: new Date() },
  open: {
    type: Number,
    default: 0,
    label:
      'The recipient received the message and opened it in their email client'
  },
  click: {
    type: Number,
    default: 0,
    label: 'The recipient clicked one or more links in the email'
  },
  complaint: {
    type: Number,
    default: 0,
    label:
      'The email was successfully delivered to the recipient. The recipient marked the email as spam'
  },
  delivery: {
    type: Number,
    default: 0,
    label: `Amazon SES successfully delivered the email to the recipient's mail server`
  },
  bounce: {
    type: Number,
    default: 0,
    label: `The recipient's mail server permanently rejected the email`
  },
  reject: {
    type: Number,
    default: 0,
    label:
      'Amazon SES accepted the email, determined that it contained a virus, and rejected it'
  },
  send: {
    type: Number,
    default: 0,
    label:
      'The call to Amazon SES was successful and Amazon SES will attempt to deliver the email'
  },
  renderingfailure: {
    type: Number,
    default: 0,
    label: `The email wasn't sent because of a template rendering issue`
  },
  total: { type: Number, default: 0, label: 'Total of all cases above' }
});

export interface IDeliveryReports {
  engageMessageId: string;
  mailId: string;
  status: string;
  customerId: string;
  email?: string;
}

export interface IDeliveryReportsDocument extends IDeliveryReports, Document {
  customerName?: string;
}

export const deliveryReportsSchema = new Schema({
  customerId: { type: String, label: 'Customer id at erxes-api', index: true },
  mailId: {
    type: String,
    optional: true,
    label: 'AWS SES mail id',
    index: true
  },
  status: {
    type: String,
    optional: true,
    label: 'Delivery status',
    index: true
  },
  engageMessageId: {
    type: String,
    optional: true,
    label: 'Engage message id at erxes-api',
    index: true
  },
  createdAt: { type: Date, label: 'Created at', default: new Date() },
  email: { type: String, label: 'Customer email', index: true }
});

export interface IStatsModel extends Model<IStatsDocument> {
  updateStats(engageMessageId: string, stat: string): Promise<void>;
}

export const loadStatsClass = (models: IModels) => {
  class Stat {
    /**
     * Increase stat by 1
     */
    public static async updateStats(engageMessageId: string, stat: string) {
      return models.Stats.updateOne(
        { engageMessageId },
        { $inc: { [stat]: 1 } }
      );
    }
  }

  statsSchema.loadClass(Stat);

  return statsSchema;
};

export interface IDeliveryReportModel extends Model<IDeliveryReportsDocument> {
  updateOrCreateReport(headers: any, status: string): Promise<boolean | string>;
}
