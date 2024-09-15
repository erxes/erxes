import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { ISyncRule, ISyncRuleDocument, xypSyncRuleSchema } from './definitions/syncRule';

export interface ISyncRuleModel extends Model<ISyncRuleDocument> {
  getSyncRule(_id: string): Promise<ISyncRuleDocument>;
  createSyncRule(doc: ISyncRule, user?: any): Promise<ISyncRuleDocument>;
  updateSyncRule(_id: string, doc: ISyncRule, user?: any): Promise<ISyncRuleDocument>;
  removeSyncRules(ids: string[]): Promise<String>;
}

export const loadSyncRuleClass = (models: IModels) => {
  class SyncRule {
    /*
     * Create new comment
     */
    public static async getSyncRule(_id: string) {
      const syncRule = await models.SyncRules.findOne({ _id }).lean();
      if (!syncRule) {
        throw new Error('SyncRule not found');
      }
      return syncRule;
    }

    /*
     * Create new comment
     */
    public static async createSyncRule(doc: any, user: any) {
      const config = await models.SyncRules.create({
        createdBy: user?._id,
        createdAt: new Date(),
        ...doc,
      });
      return config;
    }

    /*
     * Update comment
     */
    public static async updateSyncRule(_id: string, doc: any, user?: any) {
      await models.SyncRules.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user?._id,
            updatedAt: new Date(),
            ...doc,
          },
        },
      );
      return models.SyncRules.findOne({ _id }).lean();
    }

    /*
     * Remove comment
     */
    public static async removeSyncRules(ids: string[]) {
      return models.SyncRules.deleteOne({ _id: { $in: ids } });
    }
  }
  xypSyncRuleSchema.loadClass(SyncRule);
  return xypSyncRuleSchema;
};
