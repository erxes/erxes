import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import {
  bundleConditionsSchema,
  IBundleCondition,
  IBundleConditionDocument
} from './definitions/bundle';

import {
  bundleRuleSchema,
  IBundleRule,
  IBundleRuleDocument
} from './definitions/bundle';
export interface IBundleConditionModel extends Model<IBundleConditionDocument> {
  getCondidtion(doc: any): IBundleConditionDocument;
  getConditionByCode(code: string): IBundleConditionDocument;
  generateCode(code: string): string;
  createCondition(doc: IBundleCondition): IBundleConditionDocument;
  updateCondition(
    _id: string,
    fields: IBundleCondition
  ): IBundleConditionDocument;
  removeCondition(_id: string): IBundleConditionDocument;
}

export const loadBundleConditionClass = (
  models: IModels,
  subdomain: string
) => {
  class BundleCondition {
    /*
     * Get a BundleCondition
     */
    public static async getCondidtion(doc: any) {
      const condition = await models.BundleCondition.findOne(doc).lean();

      if (!condition) {
        throw new Error('BundleCondition not found');
      }

      return condition;
    }

    public static async createCondition(doc: IBundleCondition) {
      // generate code automatically
      // if there is no BundleCondition code defined
      return models.BundleCondition.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateCondition(_id: string, fields: IBundleCondition) {
      await models.BundleCondition.updateOne({ _id }, { $set: { ...fields } });
      return models.BundleCondition.findOne({ _id });
    }

    public static async removeCondition(_id) {
      const object = await models.BundleCondition.findOneAndDelete({ _id });

      if (!object) {
        throw new Error(`BundleCondition not found with id ${_id}`);
      }

      return object;
    }
  }

  bundleConditionsSchema.loadClass(BundleCondition);

  return bundleConditionsSchema;
};

export interface IBundleRuleModel extends Model<IBundleRuleDocument> {
  getRule(doc: any): IBundleRuleDocument;
  getRuleByCode(code: string): IBundleRuleDocument;
  generateCode(code: string): string;
  createRule(doc: IBundleRule): IBundleRuleDocument;
  updateRule(_id: string, fields: IBundleRule): IBundleRuleDocument;
  removeRule(_id: string): IBundleRuleDocument;
}

export const loadBundleRuleClass = (models: IModels, subdomain: string) => {
  class BundleRule {
    /*
     * Get a BundleRule
     */
    public static async getRule(doc: any) {
      const bundleRule = await models.BundleRule.findOne(doc).lean();

      if (!bundleRule) {
        throw new Error('BundleRule not found');
      }

      return bundleRule;
    }

    public static async createRule(doc: IBundleCondition) {
      // generate code automatically
      // if there is no BundleRule code defined
      return models.BundleRule.create({
        ...doc,
        createdAt: new Date()
      });
    }

    public static async updateRule(_id: string, fields: IBundleCondition) {
      await models.BundleRule.updateOne({ _id }, { $set: { ...fields } });
      return models.BundleRule.findOne({ _id });
    }

    public static async removeRule(_id) {
      const object = await models.BundleRule.findOneAndDelete({ _id });

      if (!object) {
        throw new Error(`Bundle Rule not found with id ${_id}`);
      }

      return object;
    }
  }

  bundleRuleSchema.loadClass(BundleRule);

  return bundleRuleSchema;
};
