import { Document, Model, Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { statsSchema } from '../definitions/deliveryReports';

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

export interface IStatsModel extends Model<IStatsDocument> {
  updateStats(engageMessageId: string, stat: string): Promise<void>;
}

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

export const loadStatsClass = (models: IModels) => {
  class Stat {
    /**
     * Increase stat by 1
     */
    public static async updateStats(engageMessageId: string, stat: string) {
      return models.Stats.updateOne(
        { engageMessageId },
        { $inc: { [stat]: 1 } },
      );
    }
  }

  statsSchema.loadClass(Stat);

  return statsSchema;
};

export interface IDeliveryReportModel extends Model<IDeliveryReportsDocument> {
  updateOrCreateReport(headers: any, status: string): Promise<boolean | string>;
}
