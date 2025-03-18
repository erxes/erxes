import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import {
  bundleConditionsSchema,
  IBundleCondition,
  IBundleConditionDocument,
} from './definitions/bundle';

import {
  bundleRuleSchema,
  IBundleRule,
  IBundleRuleDocument,
} from './definitions/bundle';
export interface IBundleConditionModel extends Model<IBundleConditionDocument> {
  getBrand(doc: any): IBundleConditionDocument;
  getBrandByCode(code: string): IBundleConditionDocument;
  generateCode(code: string): string;
  createBrand(doc: IBundleCondition): IBundleConditionDocument;
  updateBrand(_id: string, fields: IBundleCondition): IBundleConditionDocument;
  removeBrand(_id: string): IBundleConditionDocument;
}

export const loadBundleConditionClass = (
  models: IModels,
  subdomain: string
) => {
  class Bundle {
    /*
     * Get a Brand
     */
    public static async getBrand(doc: any) {
      const brand = await models.BundleCondition.findOne(doc).lean();

      if (!brand) {
        throw new Error('Brand not found');
      }

      return brand;
    }

    public static async createBrand(doc: IBundleCondition) {
      // generate code automatically
      // if there is no brand code defined
      return models.BundleCondition.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateBrand(_id: string, fields: IBundleCondition) {
      await models.BundleCondition.updateOne({ _id }, { $set: { ...fields } });
      return models.BundleCondition.findOne({ _id });
    }

    public static async removeBrand(_id) {
      const brandObj = await models.BundleCondition.findOneAndDelete({ _id });

      if (!brandObj) {
        throw new Error(`Brand not found with id ${_id}`);
      }

      return brandObj;
    }
  }

  bundleConditionsSchema.loadClass(Bundle);

  return bundleConditionsSchema;
};

export interface IBundleRuleModel extends Model<IBundleRuleDocument> {
  getBrand(doc: any): IBundleRuleDocument;
  getBrandByCode(code: string): IBundleRuleDocument;
  generateCode(code: string): string;
  createBrand(doc: IBundleRule): IBundleRuleDocument;
  updateBrand(_id: string, fields: IBundleRule): IBundleRuleDocument;
  removeBrand(_id: string): IBundleRuleDocument;
}

export const loadBundleRuleClass = (models: IModels, subdomain: string) => {
  class BundleRule {
    /*
     * Get a Brand
     */
    public static async getBrand(doc: any) {
      const brand = await models.BundleRule.findOne(doc).lean();

      if (!brand) {
        throw new Error('Brand not found');
      }

      return brand;
    }

    public static async createBrand(doc: IBundleCondition) {
      // generate code automatically
      // if there is no brand code defined
      return models.BundleRule.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateBrand(_id: string, fields: IBundleCondition) {
      await models.BundleRule.updateOne({ _id }, { $set: { ...fields } });
      return models.BundleRule.findOne({ _id });
    }

    public static async removeBrand(_id) {
      const brandObj = await models.BundleRule.findOneAndDelete({ _id });

      if (!brandObj) {
        throw new Error(`Brand not found with id ${_id}`);
      }

      return brandObj;
    }
  }

  bundleRuleSchema.loadClass(BundleRule);

  return bundleRuleSchema;
};
