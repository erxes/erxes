import { IContext as IMainContext } from "@erxes/api-utils/src";
import { createGenerateModels } from "@erxes/api-utils/src/core";
import * as mongoose from "mongoose";
import { ICommentModel, loadCommentClass } from "./models/Comment";
import {
  IProgramCategoryModel,
  IProgramModel,
  loadProgramCategoryClass,
  loadProgramClass,
} from "./models/Programs";
import { ICommentDocument } from "./models/definitions/comment";
import {
  IProgramCategoryDocument,
  IProgramDocument,
} from "./models/definitions/programs";

export interface IModels {
  Programs: IProgramModel;
  ProgramCategories: IProgramCategoryModel;
  Comments: ICommentModel;
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

  models.Programs = db.model<IProgramDocument, IProgramModel>(
    "programs",
    loadProgramClass(models)
  );

  models.ProgramCategories = db.model<
    IProgramCategoryDocument,
    IProgramCategoryModel
  >("programs_categories", loadProgramCategoryClass(models));

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    "programs_comments",
    loadCommentClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
