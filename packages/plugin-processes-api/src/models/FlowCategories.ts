import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { FLOW_STATUSES } from './definitions/constants';
import {
  IFlowCategory,
  IFlowCategoryDocument,
  flowCategorySchema
} from './definitions/flowCategories';

export interface IFlowCategoryModel extends Model<IFlowCategoryDocument> {
  getFlowCategory(_id: string): Promise<IFlowCategoryDocument>;
  createFlowCategory(doc: IFlowCategory): Promise<IFlowCategoryDocument>;
  updateFlowCategory(
    _id: string,
    doc: IFlowCategory
  ): Promise<IFlowCategoryDocument>;
  removeFlowCategory(_id: string): void;
}

export const loadFlowCategoryClass = (models: IModels) => {
  class FlowCategory {
    /*
     * Get a flowCategory
     */
    public static async getFlowCategory(_id: string) {
      const flowCategory = await models.FlowCategories.findOne({ _id });

      if (!flowCategory) {
        throw new Error('FlowCategory not found');
      }

      return flowCategory;
    }

    /**
     * Create a flowCategory
     */
    public static async createFlowCategory(doc: IFlowCategory) {
      const flowCategory = await models.FlowCategories.create({
        ...doc,
        createdAt: new Date()
      });

      return flowCategory;
    }

    /**
     * Update FlowCategory
     */
    public static async updateFlowCategory(_id: string, doc: IFlowCategory) {
      const flowCategory = await models.FlowCategories.getFlowCategory(_id);

      await models.FlowCategories.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.FlowCategories.getFlowCategory(_id);

      return updated;
    }

    /**
     * Remove FlowCategory
     */
    public static async removeFlowCategory(_id: string) {
      await models.FlowCategories.getFlowCategory(_id);

      let count = await models.JobRefers.countDocuments({
        categoryId: _id,
        status: { $ne: FLOW_STATUSES.ARCHIVED }
      });
      count += await models.JobCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a flow category");
      }

      return models.FlowCategories.deleteOne({ _id });
    }
  }

  flowCategorySchema.loadClass(FlowCategory);

  return flowCategorySchema;
};
