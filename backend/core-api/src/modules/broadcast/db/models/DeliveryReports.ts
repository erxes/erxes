import { IDeliveryReportsDocument, IStatsDocument } from '@/broadcast/@types';
import { statsSchema } from '@/broadcast/db/definitions/deliveryReports';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IStatsModel extends Model<IStatsDocument> {
  updateStats(engageMessageId: string, stat: string): Promise<IStatsDocument>;
}

export const loadStatsClass = (models: IModels) => {
  class Stat {
    /**
     * Increase stat by 1
     */
    public static async updateStats(engageMessageId: string, stat: string) {
      return models.Stats.findOneAndUpdate(
        { engageMessageId },
        { $inc: { [stat]: 1 } },
        { new: true },
      );
    }
  }

  statsSchema.loadClass(Stat);

  return statsSchema;
};

export interface IDeliveryReportModel extends Model<IDeliveryReportsDocument> {
  updateOrCreateReport(headers: any, status: string): Promise<boolean | string>;
}
