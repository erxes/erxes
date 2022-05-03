import * as mongoose from 'mongoose';
import {
  IInternalNoteModel,
  loadInternalNoteClass
} from './models/InternalNotes';

import { IInternalNoteDocument } from './models/definitions/internalNotes';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  InternalNotes: IInternalNoteModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.InternalNotes = db.model<IInternalNoteDocument, IInternalNoteModel>(
    'internal_notes',
    loadInternalNoteClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses)