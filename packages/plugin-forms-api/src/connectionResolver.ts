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

export interface ICoreIModels {
  Users;
}
export interface IModels {
  Fields: IFieldModel;
  FieldsGroups: IFieldGroupModel;
  Forms: IFormModel;
  FormSubmissions: IFormSubmissionModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
  return coreModels;
};

const connectCore = async () => {
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || "mongodb://localhost/erxes";
  const client = new MongoClient(url);

  const dbName = "erxes";

  let db;

  await client.connect();

  console.log("Connected successfully to server");

  db = client.db(dbName);

  coreModels = {
    Users: await db.collection("users")
  };

  return coreModels;
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
