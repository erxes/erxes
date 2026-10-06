import {
  IProductConditionGroup,
  IProductConditionGroupDocument,
} from '@/products/@types/conditionGroup';
import { productConditionGroupSchema } from '@/products/db/definitions/conditionGroups';
import { PRODUCT_STATUSES } from '@/products/constants';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IProductConditionGroupModel
  extends Model<IProductConditionGroupDocument> {
  getConditionGroup(_id: string): Promise<IProductConditionGroupDocument>;
  createConditionGroup(
    doc: IProductConditionGroup,
  ): Promise<IProductConditionGroupDocument>;
  updateConditionGroup(
    _id: string,
    doc: IProductConditionGroup,
  ): Promise<IProductConditionGroupDocument | null>;
  removeConditionGroups(_ids: string[]): Promise<{ deletedCount?: number }>;
  setCategoryConditionGroup(
    categoryId: string,
    conditionGroupId: string | null,
  ): Promise<number>;
  setProductsConditionGroup(
    productIds: string[],
    conditionGroupId: string | null,
  ): Promise<number>;
}

const prepareDoc = ({
  name,
  description,
  conditions,
}: IProductConditionGroup) => {
  const groupName = (name || '').trim();

  if (!groupName) {
    throw new Error('Group name is required');
  }

  const seen = new Set<string>();
  const cleaned = (conditions || []).map(({ _id, name: conditionName }) => {
    const trimmed = (conditionName || '').trim();

    if (!trimmed) {
      throw new Error('Condition name is required');
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      throw new Error(`Condition "${trimmed}" is listed twice`);
    }

    seen.add(key);

    // A kept _id keeps pricing plans that point at it working.
    return _id ? { _id, name: trimmed } : { name: trimmed };
  });

  return {
    name: groupName,
    description: description?.trim() || undefined,
    conditions: cleaned,
  };
};

export const loadProductConditionGroupClass = (models: IModels) => {
  class ProductConditionGroup {
    public static async getConditionGroup(_id: string) {
      const group = await models.ProductConditionGroups.findOne({ _id });

      if (!group) {
        throw new Error('Condition group not found');
      }

      return group;
    }

    public static async createConditionGroup(doc: IProductConditionGroup) {
      return models.ProductConditionGroups.create(prepareDoc(doc));
    }

    public static async updateConditionGroup(
      _id: string,
      doc: IProductConditionGroup,
    ) {
      await models.ProductConditionGroups.getConditionGroup(_id);

      return models.ProductConditionGroups.findOneAndUpdate(
        { _id },
        { $set: prepareDoc(doc) },
        { new: true },
      );
    }

    // Products left pointing at a removed group would offer nothing to pick.
    public static async removeConditionGroups(_ids: string[]) {
      await models.Products.updateProducts(
        { conditionGroupId: { $in: _ids } },
        { conditionGroupId: null },
      );

      return models.ProductConditionGroups.deleteMany({ _id: { $in: _ids } });
    }

    // Writes the group onto every product of the category and its subcategories,
    // once; products added later are set on their own or by running this again.
    public static async setCategoryConditionGroup(
      categoryId: string,
      conditionGroupId: string | null,
    ) {
      const category = await models.ProductCategories.getProductCategory({
        _id: categoryId,
      });

      if (conditionGroupId) {
        await models.ProductConditionGroups.getConditionGroup(conditionGroupId);
      }

      const categoryIds = await models.ProductCategories.find({
        order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
      }).distinct('_id');

      const query = {
        categoryId: { $in: categoryIds },
        status: { $ne: PRODUCT_STATUSES.DELETED },
      };

      const count = await models.Products.countDocuments(query);

      await models.Products.updateProducts(query, {
        conditionGroupId: conditionGroupId || null,
      });

      return count;
    }

    public static async setProductsConditionGroup(
      productIds: string[],
      conditionGroupId: string | null,
    ) {
      if (conditionGroupId) {
        await models.ProductConditionGroups.getConditionGroup(conditionGroupId);
      }

      const query = {
        _id: { $in: productIds },
        status: { $ne: PRODUCT_STATUSES.DELETED },
      };

      console.log(JSON.stringify({ query, conditionGroupId }));
      const count = await models.Products.countDocuments(query);

      await models.Products.updateProducts(query, {
        conditionGroupId: conditionGroupId || null,
      });

      return count;
    }
  }

  productConditionGroupSchema.loadClass(ProductConditionGroup);

  return productConditionGroupSchema;
};
