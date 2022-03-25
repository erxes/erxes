import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IAutomationModel, loadClass as loadAutomationClass } from './models/Automations';
import { IAutomationDocument } from './models/definitions/automaions';
import { IExecutionDocument } from './models/definitions/executions';
import { IExecutionModel, loadClass as loadExecutionClass } from './models/Executions';
import { INoteDocument } from './models/definitions/notes';
import { INoteModel, loadClass as loadNoteClass } from './models/Notes';

export interface ICoreIModels {
  Users;
}

export interface IModels {
  Automations: IAutomationModel;
  Executions: IExecutionModel;
  Notes: INoteModel;
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

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  coreModels = {
    Users: await db.collection('users'),
  };

  return coreModels;
};

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;
  
  models.Automations = db.model<IAutomationDocument, IAutomationModel>(
    'automations',
    loadAutomationClass(models)
  );

  models.Executions = db.model<IExecutionDocument, IExecutionModel>('automations_executions', loadExecutionClass(models));
  models.Notes = db.model<INoteDocument, INoteModel>('automations_notes', loadNoteClass(models));

  return models;
};