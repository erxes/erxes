import { Model } from "mongoose";
import {
  IProgram,
  IProgramCategory,
  IProgramCategoryDocument,
  IProgramDocument,
  programCategorySchema,
  programSchema,
} from "./definitions/programs";

export interface IProgramModel extends Model<IProgramDocument> {
  createProgram(doc: IProgram, user: any): Promise<IProgramDocument>;
  getProgram(_id: string): Promise<IProgramDocument>;
  updateProgram(_id: string, doc: IProgram): Promise<IProgramDocument>;
  removeActivities(programIds: string[]): Promise<IProgramDocument>;
}

export interface IProgramCategoryModel extends Model<IProgramCategoryDocument> {
  getProgramCatogery(selector: any): Promise<IProgramCategoryDocument>;
  createProgramCategory(
    doc: IProgramCategory
  ): Promise<IProgramCategoryDocument>;
  updateProgramCategory(
    _id: string,
    doc: IProgramCategory
  ): Promise<IProgramCategoryDocument>;
  removeProgramCategory(_id: string): Promise<IProgramCategoryDocument>;
  generateOrder(
    parentCategory: any,
    doc: IProgramCategory
  ): Promise<IProgramCategoryDocument>;
}

export const loadProgramClass = (models) => {
  class Program {
    static async checkCodeDuplication(code: string) {
      const program = await models.Program.findOne({
        code,
      });

      if (program) {
        throw new Error("Code must be unique");
      }
    }
    /**
     * Retreives program
     */
    public static async getProgram(_id: string) {
      const program = await models.Program.findOne({ _id });

      if (!program) {
        throw new Error("Program not found");
      }

      return program;
    }

    /**
     * Create a program
     */
    public static async createProgram(doc, user) {
      doc.code = doc.code
        .replace(/\*/g, "")
        .replace(/_/g, "")
        .replace(/ /g, "");
      await this.checkCodeDuplication(doc.code);
      const program = await models.Program.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });

      return program;
    }

    /**
     * Update program
     */
    public static async updateProgram(_id, doc) {
      const searchText = models.Program.fillSearchText(
        Object.assign(await models.Program.getProgram(_id), doc)
      );
      await models.Program.updateOne(
        { _id },
        { $set: { ...doc, searchText, modifiedAt: new Date() } }
      );

      return models.Program.findOne({ _id });
    }
  }
  programSchema.loadClass(Program);

  return programSchema;
};

export const loadProgramCategoryClass = (models) => {
  class ProgramCategory {
    /**
     *
     * Get Program Cagegory
     */

    public static async getProgramCatogery(selector: any) {
      const programCategory = await models.ProgramCategories.findOne(selector);

      if (!programCategory) {
        throw new Error("Program category not found");
      }

      return programCategory;
    }
    /**
     * Create a program categorys
     */
    public static async createProgramCategory(doc) {
      const parentCategory = doc.parentId
        ? await models.ProgramCategories.findOne({
            _id: doc.parentId,
          }).lean()
        : undefined;

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.ProgramCategories.create(doc);
    }

    /**
     * Update Program category
     */
    public static async updateProgramCategory(_id, doc) {
      const parentCategory = doc.parentId
        ? await models.ProgramCategories.findOne({
            _id: doc.parentId,
          }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error("Cannot change category");
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const programCategory = await models.ProgramCategories.getProgramCatogery(
        {
          _id,
        }
      );

      const childCategories = await models.ProgramCategories.find({
        $and: [
          { order: { $regex: new RegExp(programCategory.order, "i") } },
          { _id: { $ne: _id } },
        ],
      });

      await models.ProgramCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async (category) => {
        let order = category.order;

        order = order.replace(programCategory.order, doc.order);

        await models.ProgramCategories.updateOne(
          { _id: category._id },
          { $set: { order } }
        );
      });

      return models.ProgramCategories.findOne({ _id });
    }

    /**
     * Remove Program category
     */
    public static async removeProgramCategory(_id) {
      await models.ProgramCategories.getProgramCatogery({ _id });

      let count = await models.Program.countDocuments({ categoryId: _id });

      count += await models.ProgramCategories.countDocuments({
        parentId: _id,
      });

      if (count > 0) {
        throw new Error("Can't remove a program category");
      }

      return models.ProgramCategories.deleteOne({ _id });
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

  programCategorySchema.loadClass(ProgramCategory);

  return programCategorySchema;
};
