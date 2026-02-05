import {
  IProductRule,
  IProductRuleDocument,
} from '@/ebarimt/@types/productRule';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { productRuleSchema } from '../definitions/productRule';

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

  // 🔒 VAT rules MUST be defined via TAX
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

  // 🚫 Prevent leaking VAT fields into CTAX rules
  if (doc.kind === 'ctax') {
    if (
      doc.taxType ||
      doc.taxCode ||
      doc.taxPercent !== undefined
    ) {
      throw new Error(
        'CTAX product rule must not contain VAT tax fields',
      );
    }
  }
};

export const loadProductRuleClass = (models: IModels) => {
  class ProductRule {
    /**
     * Create a product rule
     */
    public static async createProductRule(doc: IProductRule) {
      validateProductRule(doc);

      return models.ProductRules.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    /**
     * Update a product rule
     */
    public static async updateProductRule(
      _id: string,
      doc: IProductRule,
    ) {
      validateProductRule(doc);

      return models.ProductRules.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
          },
        },
      );
    }

    public static async removeProductRules(ids: string[]) {
      return models.ProductRules.deleteMany({ _id: { $in: ids } });
    }
  }

  productRuleSchema.loadClass(ProductRule);
  return productRuleSchema;
};
