import { IModels } from '~/connectionResolvers';
import { IUsageDocument, usageSchema } from '../definitions/usage';
import { Model } from 'mongoose';

export interface IUsageModel extends Model<IUsageDocument> {
  getUsage(targetType: string): Promise<IUsageDocument>;
  getOrganizationUsages(): Promise<IUsageDocument[]>;
  addUsageCount(targetType: string, delta: number): Promise<'success'>;
  resetRecurringUsageCount(targetType: string): Promise<'success'>;
}

export const loadUsageClass = (models: IModels) => {
  class Usage {
    public static async getUsage(targetType: string) {
      const usage = await models.Usage.findOne({ targetType }).lean();
      if (!usage) {
        throw new Error('Not found');
      }
      return usage;
    }
    public static async getOrganizationUsages() {
      return await models.Usage.find({});
    }

    public static async addUsageCount(targetType: string, delta: number) {
      const usage = models.Usage.findOneAndUpdate(
        { targetType },
        { $inc: { totalCount: delta, count: delta } },
        { upsert: true },
      );

      return 'success';
    }
    public static async resetRecurringUsageCount(targetType: string) {
      const usage = models.Usage.findOneAndUpdate({ targetType }, { count: 0 });

      return 'success';
    }
  }

  usageSchema.loadClass(Usage);
  return usageSchema;
};
