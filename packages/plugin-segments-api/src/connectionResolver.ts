import * as mongoose from 'mongoose';
import { ISegmentDocument } from './models/definitions/segments';
import { ISegmentModel, loadClass } from './models/Segments';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Segments: ISegmentModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Segments = db.model<ISegmentDocument, ISegmentModel>('segments', loadClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses)