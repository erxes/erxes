import {
  IProductRule,
  IProductRuleDocument,
} from '@/ebarimt/@types/productRule';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { productRuleSchema } from '../definitions/productRule';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IProductRuleModel extends Model<IProductRuleDocument> {
  createProductRule(doc: IProductRule): Promise<IProductRuleDocument>;
  updateProductRule(
    _id: string,
    doc: IProductRule,
  ): Promise<IProductRuleDocument>;
  removeProductRules(ids: string[]): Promise<{ n: number; ok: number }>;
}

const validateProductRule = (doc: IProductRule) => {
  if (!doc.kind) {
    throw new Error('Product rule kind is required');
  }

  if (!['vat', 'ctax'].includes(doc.kind)) {
    throw new Error(`Invalid product rule kind: ${doc.kind}`);
  }

  if (doc.kind === 'vat') {
    if (!doc.taxType) {
      throw new Error('VAT product rule requires taxType');
    }
    if (!doc.taxCode) {
      throw new Error('VAT product rule requires taxCode');
    }
    if (doc.taxPercent === undefined || doc.taxPercent === null) {
      throw new Error('VAT product rule requires taxPercent');
    }
  }

  if (doc.kind === 'ctax' && doc.taxPercent === undefined) {
    throw new Error('CTAX product rule must not contain VAT tax fields');
  }
};

export const loadProductRuleClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class ProductRule {
    /**
     * Create a product rule
     */
    public static async createProductRule(doc: IProductRule) {
      validateProductRule(doc);

      const rule = await models.ProductRules.create({
        ...doc,
        createdAt: new Date(),
      });

      sendDbEventLog({
        action: 'create',
        docId: rule._id,
        currentDocument: rule.toObject(),
      });

      return rule;
    }

    /**
     * Update a product rule
     */
    public static async updateProductRule(
      _id: string,
      doc: IProductRule,
    ) {
      validateProductRule(doc);

      const oldRule = await models.ProductRules.findOne({ _id }).lean();
      if (!oldRule) {
        throw new Error('Product rule not found');
      }

      await models.ProductRules.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
          },
        },
      );

      const updatedRule = await models.ProductRules.findOne({ _id }).lean();

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updatedRule,
        prevDocument: oldRule,
      });

      return updatedRule as IProductRuleDocument;
    }

    public static async removeProductRules(ids: string[]) {
      // Fetch the documents before deletion to log them
      const rules = await models.ProductRules.find({ _id: { $in: ids } }).lean();

      const result = await models.ProductRules.deleteMany({ _id: { $in: ids } });

      // Log each deleted document individually
      for (const rule of rules) {
        sendDbEventLog({
          action: 'delete',
          docId: rule._id,
        });
      }

      return result;
    }
  }

  productRuleSchema.loadClass(ProductRule);
  return productRuleSchema;
};