import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IAutomationModel, loadClass as loadAutomationClass } from './models/Automations';
import { IAutomationDocument } from './models/definitions/automaions';
import { IExecutionDocument } from './models/definitions/executions';
import { IExecutionModel, loadClass as loadExecutionClass } from './models/Executions';
import { INoteDocument } from './models/definitions/notes';
import { INoteModel, loadClass as loadNoteClass } from './models/Notes';

export interface IModels {
  Automations: IAutomationModel;
  Executions: IExecutionModel;
  Notes: INoteModel;
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