import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ISafetyTip,
  ISafetyTipDocument,
  safetyTipsSchema
} from './definitions/safetyTips';
export interface ISafetyTipsModel extends Model<ISafetyTipDocument> {
  addSafetyTip(
    doc: { categoryId?: string } & ISafetyTip
  ): Promise<ISafetyTipDocument>;
  updateSafetyTip(
    doc: { _id: string; categoryId?: string } & ISafetyTip
  ): Promise<ISafetyTipDocument>;
  removeSafetyTip(__id: string): Promise<ISafetyTipDocument>;
}

const validateDoc = doc => {
  if (!doc.name) {
    throw new Error('Please provide a name');
  }

  if (!doc?.kbCategoryId) {
    throw new Error('Please provide some kb articles');
  }

  if (!doc?.branchIds?.length) {
    throw new Error('Please provide branchIds');
  }
};

export const loadSafetyTipsClass = (models: IModels, subdomain: string) => {
  class SafetyTips {
    public static async addSafetyTip(
      doc: { categoryId?: string } & ISafetyTip
    ) {
      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      await this.updateBranchIds(doc);

      return models.SafetyTips.create({ ...doc, createdAt: new Date() });
    }
    public static async updateSafetyTip(
      doc: { _id: string; categoryId?: string } & ISafetyTip
    ) {
      const safetyTip = await models.SafetyTips.findOne({ _id: doc._id });

      if (!safetyTip) {
        throw new Error('Not found');
      }

      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      await this.updateBranchIds(doc);

      return await models.SafetyTips.findByIdAndUpdate(
        { _id: doc._id },
        { $set: { ...doc } }
      );
    }
    public static async removeSafetyTip(_id: string) {
      return await models.SafetyTips.findByIdAndUpdate(
        { _id },
        { $set: { status: 'deleted' } }
      );
    }

    static async updateBranchIds({ branchIds }) {
      await models.SafetyTips.updateMany(
        { branchIds: { $in: branchIds } },
        { $pull: { branchIds: { $in: branchIds } } }
      );
    }
  }

  safetyTipsSchema.loadClass(SafetyTips);
  return safetyTipsSchema;
};
