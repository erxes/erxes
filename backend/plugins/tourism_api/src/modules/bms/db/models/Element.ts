import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IElement,
  IElementCategory,
  IElementCategoryDocument,
  IElementDocument,
} from '@/bms/@types/element';
import {
  elementCategorySchema,
  elementSchema,
} from '@/bms/db/definitions/element';

export interface IElementModel extends Model<IElementDocument> {
  createElement(doc: IElement, user: any): Promise<IElementDocument>;
  getElement(_id: string): Promise<IElementDocument>;
  updateElement(_id: string, doc: IElement): Promise<IElementDocument>;
  removeElements(ids: string[]): Promise<IElementDocument>;
}

export interface IElementCategoryModel extends Model<IElementCategoryDocument> {
  getElementCategory(selector: any): Promise<IElementCategoryDocument>;
  createElementCategory(
    doc: IElementCategory,
  ): Promise<IElementCategoryDocument>;
  updateElementCategory(
    _id: string,
    doc: IElementCategory,
  ): Promise<IElementCategoryDocument>;
  removeElementCategory(_id: string): Promise<IElementCategoryDocument>;
}

export const loadElementClass = (models: IModels) => {
  class Element {
    public static async getElement(_id: string) {
      const element = await models.Elements.findOne({ _id });
      if (!element) {
        throw new Error('Element not found');
      }
      return element;
    }

    public static async createElement(doc, user) {
      const element = await models.Elements.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
      return element;
    }

    public static async updateElement(_id, doc) {
      await models.Elements.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } },
      );

      return await models.Elements.findOne({ _id });
    }

    public static async removeElements(ids) {
      return await models.Elements.deleteMany({ _id: { $in: ids } });
    }
  }

  elementSchema.loadClass(Element);

  return elementSchema;
};

export const loadElementCategoryClass = (models: IModels) => {
  class ElementCategory {
    public static async getElementCategory(selector: any) {
      const elementCategory = await models.ElementCategories.findOne(selector);

      if (!elementCategory) {
        throw new Error('element Category not found');
      }

      return elementCategory;
    }

    public static async createElementCategory(doc) {
      const parentCategory = doc.parentId
        ? await models.ElementCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.ElementCategories.create(doc);
    }

    public static async updateElementCategory(_id, doc) {
      const parentCategory = doc.parentId
        ? await models.ElementCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      doc.order = await this.generateOrder(parentCategory, doc);

      const category = await models.ElementCategories.getElementCategory({
        _id,
      });

      await models.ElementCategories.updateOne({ _id }, { $set: doc });

      return models.ElementCategories.findOne({ _id });
    }

    public static async removeElementCategory(_id) {
      await models.ElementCategories.getElementCategory({ _id });

      let count = await models.Elements.countDocuments({ categoryId: _id });

      count += await models.ElementCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a category");
      }

      return models.ElementCategories.deleteOne({ _id });
    }

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
