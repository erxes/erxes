import { IContext as IMainContext } from "@erxes/api-utils/src";
import { createGenerateModels } from "@erxes/api-utils/src/core";
import * as mongoose from "mongoose";
import { ICommentModel, loadCommentClass } from "./models/Comments";
import {
  IActivityCategoryModel,
  IActivityModel,
  loadActivityCategoryClass,
  loadActivityClass,
} from "./models/Activities";
import { ICommentDocument } from "./models/definitions/comments";
import {
  IActivityCategoryDocument,
  IActivityDocument,
} from "./models/definitions/activities";
import { IAttendancesModel, loadAttendancesClass } from "./models/Attendances";
import { IAttendancesDocument } from "./models/definitions/attendances";
import { IClassesModel, loadClassesClass } from "./models/Classes";
import { IClassesDocument } from "./models/definitions/classes";

export interface IModels {
  Activities: IActivityModel;
  ActivityCategories: IActivityCategoryModel;
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

  models.Activities = db.model<IActivityDocument, IActivityModel>(
    "activities",
    loadActivityClass(models)
  );

  models.ActivityCategories = db.model<
    IActivityCategoryDocument,
    IActivityCategoryModel
  >("activities_categories", loadActivityCategoryClass(models));

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    "activities_comments",
    loadCommentClass(models)
  );

  models.Attendances = db.model<IAttendancesDocument, IAttendancesModel>(
    "activities_attendances",
    loadAttendancesClass(models)
  );

  models.Classes = db.model<IClassesDocument, IClassesModel>(
    "activities_classes",
    loadClassesClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
