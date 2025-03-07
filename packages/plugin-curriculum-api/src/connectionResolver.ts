import { IContext as IMainContext } from "@erxes/api-utils/src";
import { createGenerateModels } from "@erxes/api-utils/src/core";
import * as mongoose from "mongoose";
import {
  ICurriculumCategoryModel,
  ICurriculumModel,
  loadCurriculumCategoryClass,
  loadCurriculumClass,
} from "./models/Curriculum";
import {
  ICurriculumCategoryDocument,
  ICurriculumDocument,
} from "./models/definitions/curriculum";

export interface IModels {
  Curriculum: ICurriculumModel;
  CurriculumCategories: ICurriculumCategoryModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Curriculum = db.model<ICurriculumDocument, ICurriculumModel>(
    "curriculum",
    loadCurriculumClass(models)
  );

  models.CurriculumCategories = db.model<
    ICurriculumCategoryDocument,
    ICurriculumCategoryModel
  >("curriculum_categories", loadCurriculumCategoryClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
