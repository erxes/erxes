import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { assetCategoriesSchema } from './definitions/assets';

import { ASSET_STATUSES } from '../common/constant/asset';
import {
  IAssetCategories,
  IAssetCategoriesDocument
} from '../common/types/asset';
export interface IAssetCategoriesModel extends Model<IAssetCategoriesDocument> {
  assetCategoryAdd(doc: IAssetCategories): Promise<IAssetCategoriesDocument>;
  getAssetCategory(selector: any): Promise<IAssetCategoriesDocument>;
  updateAssetCategory(
    _id: string,
    doc: IAssetCategories
  ): Promise<IAssetCategoriesDocument>;
  assetCategoryRemove(_id: string): void;
}

export const loadAssetCategoriesClass = (models: IModels) => {
  class AssetCategory {
    public static async getAssetCategory(selector: any) {
      const assetCategories = await models.AssetCategories.findOne(selector);

      if (!assetCategories) {
        throw new Error('Asset Category not found');
      }

      return assetCategories;
    }

    public static async assetCategoryAdd(doc: IAssetCategories) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await models.AssetCategories.findOne({
        _id: doc.parentId
      }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.AssetCategories.create(doc);
    }

    public static async updateAssetCategory(
      _id: string,
      doc: IAssetCategories
    ) {
      const category = await models.AssetCategories.getAssetCategory({
        _id
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.AssetCategories.findOne({
        _id: doc.parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const assetCategories = await models.AssetCategories.getAssetCategory({
        _id
      });

      const childCategories = await models.AssetCategories.find({
        $and: [
          { order: { $regex: new RegExp(assetCategories.order, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      await models.AssetCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async childCategory => {
        let order = childCategory.order;

        order = order.replace(assetCategories.order, doc.order);

        await models.AssetCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } }
        );
      });

      return models.AssetCategories.findOne({ _id });
    }

    public static async assetCategoryRemove(_id: string) {
      await models.AssetCategories.getAssetCategory({ _id });

      let count = await models.Assets.countDocuments({
        categoryId: _id,
        status: { $ne: ASSET_STATUSES.DELETED }
      });
      count += await models.AssetCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a asset category");
      }

      return models.AssetCategories.deleteOne({ _id });
    }

    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.AssetCategories.findOne({
        code
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }
    public static async generateOrder(
      parentCategory: IAssetCategories,
      doc: IAssetCategories
    ) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }

  assetCategoriesSchema.loadClass(AssetCategory);

  return assetCategoriesSchema;
};
