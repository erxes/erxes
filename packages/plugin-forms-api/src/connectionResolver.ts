import * as mongoose from "mongoose";
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
import { createGenerateModels } from "@erxes/api-utils/src/core";

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

export let models: IModels | null = null;


export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Fields = db.model<IFieldDocument, IFieldModel>(
    "fields",
    loadFieldClass(models, subdomain)
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

export const generateModels = createGenerateModels<IModels>(models, loadClasses);