import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import {
  IInternalNoteModel,
  loadInternalNoteClass
} from './models/InternalNotes';

import { IInternalNoteDocument } from './models/definitions/internalNotes';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface IModels {
  InternalNotes: IInternalNoteModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }


  loadClasses(mainDb);

  return models;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    'internal_notes',
    loadInternalNoteClass(models)
  );

  return models;
};
