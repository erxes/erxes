import { Model } from 'mongoose';
import { ICarCategory, ICarCategoryDocument } from '../../@types/category';
import { IModels } from '~/connectionResolvers';
import { categorySchema } from '../definitions/category';

export interface ICarCategoryModel extends Model<ICarCategoryDocument> {
  carCategoryDetail(selector: any): Promise<ICarCategoryDocument>;
  carsCategoryAdd(doc: ICarCategory): Promise<ICarCategoryDocument>;
  carsCategories(doc: ICarCategory): Promise<ICarCategoryDocument>;
  carsCategoriesEdit(
    _id: string,
    doc: ICarCategory,
  ): Promise<ICarCategoryDocument>;
  carsCategoriesRemove(ModuleId: string): Promise<ICarCategoryDocument>;
  generateOrder(
    parentCategory: any,
    doc: ICarCategory,
  ): Promise<ICarCategoryDocument>;
}

export const loadCarCategoryClass = (models: IModels) => {
  class CarCategories {
    public static async carCategoryDetail(_id: string) {
      return await models.CarCategories.findOne({ _id }).lean();
    }

    public static async carsCategories(): Promise<ICarCategoryDocument[]> {
      return models.CarCategories.find().lean();
    }

    public static async carsCategoryAdd(
      doc: ICarCategory,
    ): Promise<ICarCategoryDocument> {
      const parentCategory = doc.parentId
        ? await models.CarCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.CarCategories.create(doc);
    }

    public static async carsCategoriesEdit(_id: string, doc: ICarCategory) {
      const parentCategory = doc.parentId
        ? await models.CarCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const carCategory = await models.CarCategories.carCategoryDetail(_id);

      const childCategories = await models.CarCategories.find({
        $and: [
          { order: { $regex: new RegExp(carCategory.order, 'i') } },
          { _id: { $ne: _id } },
        ],
      });

      childCategories.forEach(async (category) => {
        let order = category.order;

        order = order.replace(carCategory.order, doc.order);

        await models.CarCategories.updateOne(
          { _id: category._id },
          { $set: { order } },
        );
      });

      await models.CarCategories.updateOne({ _id }, { $set: doc });

      return models.CarCategories.findOne({ _id });
    }

    public static async carsCategoriesRemove(_id: string) {
      await models.CarCategories.carCategoryDetail(_id);

      let count = await models.Cars.countDocuments({
        categoryId: _id,
      });

      count += await models.CarCategories.countDocuments({
        parentId: _id,
      });

      if (count > 0) {
        throw new Error("Can't remove a car category");
      }

      return await models.CarCategories.deleteOne({ _id });
    }

    public static async generateOrder(parentCategory: any, doc: ICarCategory) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }

  categorySchema.loadClass(CarCategories);
  return categorySchema;
};
