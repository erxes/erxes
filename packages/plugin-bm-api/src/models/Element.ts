// import { sendCoreMessage, sendInternalNotesMessage } from '../messageBroker';

import { Model } from 'mongoose';
import { validSearchText } from '@erxes/api-utils/src';
import {
  elementCategorySchema,
  elementSchema,
  IElement,
  IElementCategory,
  IElementCategoryDocument,
  IElementDocument,
} from './definitions/element';
import { IContext, IModels } from '../connectionResolver';

export interface IElementModel extends Model<IElementDocument> {
  createElement(doc: IElement, user: any): Promise<IElementDocument>;
  getElement(_id: string): Promise<IElementDocument>;
  updateElement(_id: string, doc: IElement): Promise<IElementDocument>;
  removeElements(ids: string[]): Promise<IElementDocument>;
}

export interface IElementCategoryModel extends Model<IElementCategoryDocument> {
  getElementCatogery(selector: any): Promise<IElementCategoryDocument>;
  createElementCategory(
    doc: IElementCategory
  ): Promise<IElementCategoryDocument>;
  updateElementCategory(
    _id: string,
    doc: IElementCategory
  ): Promise<IElementCategoryDocument>;
  removeElementCategory(_id: string): Promise<IElementCategoryDocument>;
}

export const loadElementClass = (models: IModels, subdomain: string) => {
  class Element {
    /**
     * Retreives element
     */
    public static async getElement(_id: string) {
      const element = await models.Elements.findOne({ _id });
      if (!element) {
        throw new Error('Element not found');
      }
      return element;
    }
    /**
     * Create a element
     */
    public static async createElement(doc, user) {
      const element = await models.Elements.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
      return element;
    }

    /**
     * Update element
     */
    public static async updateElement(_id, doc) {
      await models.Elements.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return await models.Elements.findOne({ _id });
    }

    /**
     * Remove elements
     */
    public static async removeElements(ids) {
      return await models.Elements.deleteMany({ _id: { $in: ids } });
    }
  }

  elementSchema.loadClass(Element);

  return elementSchema;
};

export const loadElementCategoryClass = (
  models: IModels,
  subdomain: string
) => {
  class ElementCategory {
    /**
     *
     * Get Element Cagegory
     */

    public static async getElementCatogery(selector: any) {
      const elementCategory = await models.ElementCategories.findOne(selector);

      if (!elementCategory) {
        throw new Error('element Category not found');
      }

      return elementCategory;
    }

    /**
     * Create a element categorys
     */
    public static async createElementCategory(doc) {
      const parentCategory = doc.parentId
        ? await models.ElementCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.ElementCategories.create(doc);
    }

    /**
     * Update Element category
     */
    public static async updateElementCategory(_id, doc) {
      const parentCategory = doc.parentId
        ? await models.ElementCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const carCategory = await models.ElementCategories.getElementCatogery({
        _id,
      });

      // const childCategories = await models.ElementCategories.find({
      //   $and: [
      //     { order: { $regex: new RegExp(carCategory.order, 'i') } },
      //     { _id: { $ne: _id } },
      //   ],
      // });

      await models.ElementCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      // childCategories.forEach(async category => {
      //   let order = category.order;

      //   order = order.replace(carCategory.order, doc.order);

      //   await models.CarCategories.updateOne(
      //     { _id: category._id },
      //     { $set: { order } }
      //   );
      // });

      return models.ElementCategories.findOne({ _id });
    }

    /**
     * Remove Car category
     */
    public static async removeElementCategory(_id) {
      await models.ElementCategories.getElementCatogery({ _id });

      let count = await models.Elements.countDocuments({ categoryId: _id });

      count += await models.ElementCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a car category");
      }

      return models.ElementCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(parentCategory, doc) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }

  elementCategorySchema.loadClass(ElementCategory);

  return elementCategorySchema;
};
