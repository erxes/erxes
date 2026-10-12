import {
  IProductCondition,
  IProductConditionDocument,
  ProductConditionCodesMode,
} from '@/products/@types/condition';
import { productConditionSchema } from '@/products/db/definitions/conditions';
import { PRODUCT_STATUSES } from '@/products/constants';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IProductConditionModel
  extends Model<IProductConditionDocument> {
  getCondition(_id: string): Promise<IProductConditionDocument>;
  createCondition(doc: IProductCondition): Promise<IProductConditionDocument>;
  updateCondition(
    _id: string,
    doc: IProductCondition,
  ): Promise<IProductConditionDocument | null>;
  removeConditions(_ids: string[]): Promise<{ deletedCount?: number }>;
  setCategoryConditionCodes(
    categoryId: string,
    codes: string[],
    mode: ProductConditionCodesMode,
  ): Promise<number>;
  setProductsConditionCodes(
    productIds: string[],
    codes: string[],
    mode: ProductConditionCodesMode,
  ): Promise<number>;
}

const prepareDoc = ({ code, name, description }: IProductCondition) => {
  const cleanCode = (code || '').trim();
  const cleanName = (name || '').trim();

  if (!cleanCode) {
    throw new Error('Condition code is required');
  }

  if (!cleanName) {
    throw new Error('Condition name is required');
  }

  return {
    code: cleanCode,
    name: cleanName,
    description: description?.trim() || undefined,
  };
};

const cleanCodes = (codes: string[]) => {
  const cleaned = [...new Set(codes.map((code) => code.trim()))].filter(
    Boolean,
  );

  if (!cleaned.length) {
    throw new Error('Choose at least one condition');
  }

  return cleaned;
};

export const loadProductConditionClass = (models: IModels) => {
  class ProductCondition {
    public static async getCondition(_id: string) {
      const condition = await models.ProductConditions.findOne({ _id });

      if (!condition) {
        throw new Error('Condition not found');
      }

      return condition;
    }

    private static async checkCodeFree(code: string, _id?: string) {
      const taken = await models.ProductConditions.exists({
        code,
        ...(_id ? { _id: { $ne: _id } } : {}),
      });

      if (taken) {
        throw new Error(`Condition code "${code}" is already used`);
      }
    }

    public static async createCondition(doc: IProductCondition) {
      const prepared = prepareDoc(doc);

      await this.checkCodeFree(prepared.code);

      return models.ProductConditions.create(prepared);
    }

    // A changed code is not carried onto products or plans; they keep the old one.
    public static async updateCondition(_id: string, doc: IProductCondition) {
      await models.ProductConditions.getCondition(_id);

      const prepared = prepareDoc(doc);

      await this.checkCodeFree(prepared.code, _id);

      return models.ProductConditions.findOneAndUpdate(
        { _id },
        { $set: prepared },
        { new: true },
      );
    }

    // Products keep the codes, so recreating a condition with the code restores it.
    public static async removeConditions(_ids: string[]) {
      return models.ProductConditions.deleteMany({ _id: { $in: _ids } });
    }

    private static async setConditionCodes(
      query: Record<string, unknown>,
      codes: string[],
      mode: ProductConditionCodesMode,
    ) {
      const cleaned = cleanCodes(codes);
      const productQuery = {
        ...query,
        status: { $ne: PRODUCT_STATUSES.DELETED },
      };

      const count = await models.Products.countDocuments(productQuery);

      await models.Products.updateProducts(
        productQuery,
        { conditionCodes: cleaned },
        mode === 'add'
          ? { $addToSet: { conditionCodes: { $each: cleaned } } }
          : { $pull: { conditionCodes: { $in: cleaned } } },
      );

      return count;
    }

    // Touches every product of the category and its subcategories, once;
    // products added later are set on their own or by running this again.
    public static async setCategoryConditionCodes(
      categoryId: string,
      codes: string[],
      mode: ProductConditionCodesMode,
    ) {
      const category = await models.ProductCategories.getProductCategory({
        _id: categoryId,
      });

      const categoryIds = await models.ProductCategories.find({
        order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
      }).distinct('_id');

      return this.setConditionCodes(
        { categoryId: { $in: categoryIds } },
        codes,
        mode,
      );
    }

    public static async setProductsConditionCodes(
      productIds: string[],
      codes: string[],
      mode: ProductConditionCodesMode,
    ) {
      return this.setConditionCodes({ _id: { $in: productIds } }, codes, mode);
    }
  }

  productConditionSchema.loadClass(ProductCondition);

  return productConditionSchema;
};
