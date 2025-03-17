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
import { IAttendancesModel, loadAttendancesClass } from "./models/Attendances";
import { IAttendancesDocument } from "./models/definitions/attendances";
import { IClassesModel, loadClassesClass } from "./models/Classes";
import { IClassesDocument } from "./models/definitions/classes";

export interface IModels {
  Programs: IProgramModel;
  ProgramCategories: IProgramCategoryModel;
  Comments: ICommentModel;
  Attendances: IAttendancesModel;
  Classes: IClassesModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
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

  models.Attendances = db.model<IAttendancesDocument, IAttendancesModel>(
    "programs_attendances",
    loadAttendancesClass(models)
  );

  models.Classes = db.model<IClassesDocument, IClassesModel>(
    "programs_classes",
    loadClassesClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
