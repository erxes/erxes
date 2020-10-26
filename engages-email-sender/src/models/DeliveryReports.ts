import { Document, Model, model, Schema } from 'mongoose';

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
  engageMessageId: { type: String },
  createdAt: { type: Date, default: new Date() },
  open: { type: Number, default: 0 },
  click: { type: Number, default: 0 },
  complaint: { type: Number, default: 0 },
  delivery: { type: Number, default: 0 },
  bounce: { type: Number, default: 0 },
  reject: { type: Number, default: 0 },
  send: { type: Number, default: 0 },
  renderingfailure: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

export interface IDeliveryReports {
  engageMessageId: string;
  mailId: string;
  status: string;
  customerId: string;
}

export interface IDeliveryReportsDocument extends IDeliveryReports, Document {}

export const deliveryReportsSchema = new Schema({
  customerId: { type: String },
  mailId: { type: String, optional: true },
  status: { type: String, optional: true },
  engageMessageId: { type: String, optional: true },
  createdAt: { type: Date },
});

export interface IStatsModel extends Model<IStatsDocument> {
  updateStats(engageMessageId: string, stat: string): Promise<void>;
}

export const loadStatsClass = () => {
  class Stat {
    /**
     * Increase stat by 1
     */
    public static async updateStats(engageMessageId: string, stat: string) {
      return Stats.updateOne({ engageMessageId }, { $inc: { [stat]: 1 } });
    }
  }

  statsSchema.loadClass(Stat);

  return statsSchema;
};

loadStatsClass();

// tslint:disable-next-line
const Stats = model<IStatsDocument, IStatsModel>('engage_stats', statsSchema);

export interface IDeliveryReportModel extends Model<IDeliveryReportsDocument> {
  updateOrCreateReport(headers: any, status: string): Promise<boolean | string>;
}

export const loadDeliveryReportsClass = () => {
  class DeliveryReport {
    /**
     * Change delivery report status
     */
    public static async updateOrCreateReport(headers: any, status: string) {
      const { engageMessageId, mailId, customerId } = headers;

      const deliveryReports = await DeliveryReports.findOne({ engageMessageId });

      if (deliveryReports) {
        await DeliveryReports.updateOne({ engageMessageId }, { $set: { mailId, status } });
      } else {
        await DeliveryReports.create({ customerId, mailId, engageMessageId, status });
      }

      if (status === 'complaint' || status === 'bounce' || status === 'reject') {
        return 'reject';
      }

      return true;
    }
  }

  deliveryReportsSchema.loadClass(DeliveryReport);

  return deliveryReportsSchema;
};

loadDeliveryReportsClass();

// tslint:disable-next-line
const DeliveryReports = model<IDeliveryReportsDocument, IDeliveryReportModel>(
  'delivery_reports',
  deliveryReportsSchema,
);

export { Stats, DeliveryReports };
