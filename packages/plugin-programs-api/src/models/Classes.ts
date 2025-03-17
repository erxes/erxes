import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import {
  classesSchema,
  IClasses,
  IClassesDocument,
} from "./definitions/classes";

export interface IClassesModel extends Model<IClassesDocument> {
  getClasses(_id: string): Promise<IClassesDocument>;
  createClasses(doc: IClasses): Promise<IClassesDocument>;
}

export const loadClassesClass = (models: IModels) => {
  class Classes {
    /**
     * Retreives classes
     */
    public static async getClasses(_id: string) {
      const programClass = await models.Classes.findOne({ _id });

      if (!programClass) {
        throw new Error("Class not found");
      }

      return programClass;
    }

    public static async createClasses(doc) {
      return models.Classes.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
    }
  }

  classesSchema.loadClass(Classes);

  return classesSchema;
};
