import { MongoClient } from "mongodb";
import * as mongoose from "mongoose";
import { mainDb } from "./configs";
import {
  IFieldDocument,
  IFieldGroupDocument
} from "./models/definitions/fields";
import {
  IFormDocument,
  IFormSubmissionDocument
} from "./models/definitions/forms";
import { IContext as IMainContext } from "@erxes/api-utils/src";
import {
  IFieldModel,
  IFieldGroupModel,
  loadFieldClass,
  loadGroupClass
} from "./models/Fields";
import {
  IFormModel,
  IFormSubmissionModel,
  loadFormClass,
  loadFormSubmissionClass
} from "./models/Forms";

export interface IModels {
  Fields: IFieldModel;
  FieldsGroups: IFieldGroupModel;
  Forms: IFormModel;
  FormSubmissions: IFormSubmissionModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Fields = db.model<IFieldDocument, IFieldModel>(
    "fields",
    loadFieldClass(models)
  );
  models.FieldsGroups = db.model<IFieldGroupDocument, IFieldGroupModel>(
    "fields_groups",
    loadGroupClass(models)
  );
  models.Forms = db.model<IFormDocument, IFormModel>(
    "forms",
    loadFormClass(models)
  );
  models.FormSubmissions = db.model<
    IFormSubmissionDocument,
    IFormSubmissionModel
  >("form_submissions", loadFormSubmissionClass(models));

  return models;
};
