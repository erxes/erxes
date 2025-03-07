import { Model } from "mongoose";
import {
  curriculumCategorySchema,
  curriculumSchema,
  ICurriculum,
  ICurriculumCategory,
  ICurriculumCategoryDocument,
  ICurriculumDocument,
} from "./definitions/curriculum";

export interface ICurriculumModel extends Model<ICurriculumDocument> {
  createCurriculum(doc: ICurriculum, user: any): Promise<ICurriculumDocument>;
  getCurriculum(_id: string): Promise<ICurriculumDocument>;
  updateCurriculum(_id: string, doc: ICurriculum): Promise<ICurriculumDocument>;
  removeActivities(curriculumIds: string[]): Promise<ICurriculumDocument>;
}

export interface ICurriculumCategoryModel
  extends Model<ICurriculumCategoryDocument> {
  getCurriculumCatogery(selector: any): Promise<ICurriculumCategoryDocument>;
  createCurriculumCategory(
    doc: ICurriculumCategory
  ): Promise<ICurriculumCategoryDocument>;
  updateCurriculumCategory(
    _id: string,
    doc: ICurriculumCategory
  ): Promise<ICurriculumCategoryDocument>;
  removeCurriculumCategory(_id: string): Promise<ICurriculumCategoryDocument>;
  generateOrder(
    parentCategory: any,
    doc: ICurriculumCategory
  ): Promise<ICurriculumCategoryDocument>;
}

export const loadCurriculumClass = (models) => {
  class Curriculum {
    static async checkCodeDuplication(code: string) {
      const curriculum = await models.Curriculum.findOne({
        code,
      });

      if (curriculum) {
        throw new Error("Code must be unique");
      }
    }
    /**
     * Retreives curriculum
     */
    public static async getCurriculum(_id: string) {
      const curriculum = await models.Curriculum.findOne({ _id });

      if (!curriculum) {
        throw new Error("Curriculum not found");
      }

      return curriculum;
    }

    /**
     * Create a curriculum
     */
    public static async createCurriculum(doc, user) {
      doc.code = doc.code
        .replace(/\*/g, "")
        .replace(/_/g, "")
        .replace(/ /g, "");
      await this.checkCodeDuplication(doc.code);
      const curriculum = await models.Curriculum.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });

      return curriculum;
    }

    /**
     * Update curriculum
     */
    public static async updateCurriculum(_id, doc) {
      const searchText = models.Curriculum.fillSearchText(
        Object.assign(await models.Curriculum.getCurriculum(_id), doc)
      );
      await models.Curriculum.updateOne(
        { _id },
        { $set: { ...doc, searchText, modifiedAt: new Date() } }
      );

      return models.Curriculum.findOne({ _id });
    }
  }
  curriculumSchema.loadClass(Curriculum);

  return curriculumSchema;
};

export const loadCurriculumCategoryClass = (models) => {
  class CurriculumCategory {
    /**
     *
     * Get Curriculum Cagegory
     */

    public static async getCurriculumCatogery(selector: any) {
      const curriculumCategory =
        await models.CurriculumCategories.findOne(selector);

      if (!curriculumCategory) {
        throw new Error("Curriculum category not found");
      }

      return curriculumCategory;
    }
    /**
     * Create a curriculum categorys
     */
    public static async createCurriculumCategory(doc) {
      const parentCategory = doc.parentId
        ? await models.CurriculumCategories.findOne({
            _id: doc.parentId,
          }).lean()
        : undefined;

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.CurriculumCategories.create(doc);
    }

    /**
     * Update Curriculum category
     */
    public static async updateCurriculumCategory(_id, doc) {
      const parentCategory = doc.parentId
        ? await models.CurriculumCategories.findOne({
            _id: doc.parentId,
          }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error("Cannot change category");
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const curriculumCategory =
        await models.CurriculumCategories.getCurriculumCatogery({
          _id,
        });

      const childCategories = await models.CurriculumCategories.find({
        $and: [
          { order: { $regex: new RegExp(curriculumCategory.order, "i") } },
          { _id: { $ne: _id } },
        ],
      });

      await models.CurriculumCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async (category) => {
        let order = category.order;

        order = order.replace(curriculumCategory.order, doc.order);

        await models.CurriculumCategories.updateOne(
          { _id: category._id },
          { $set: { order } }
        );
      });

      return models.CurriculumCategories.findOne({ _id });
    }

    /**
     * Remove Curriculum category
     */
    public static async removeCurriculumCategory(_id) {
      await models.CurriculumCategories.getCurriculumCatogery({ _id });

      let count = await models.Curriculum.countDocuments({ categoryId: _id });

      count += await models.CurriculumCategories.countDocuments({
        parentId: _id,
      });

      if (count > 0) {
        throw new Error("Can't remove a curriculum category");
      }

      return models.CurriculumCategories.deleteOne({ _id });
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

  curriculumCategorySchema.loadClass(CurriculumCategory);

  return curriculumCategorySchema;
};
