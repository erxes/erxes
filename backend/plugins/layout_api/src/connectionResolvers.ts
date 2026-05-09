import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { ILayoutsDocument } from '@/layouts/@types/layouts';

import mongoose from 'mongoose';

import { loadLayoutsClass, ILayoutsModel } from '@/layouts/db/models/Layouts';

export interface IModels {
  Layouts: ILayoutsModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Layouts = db.model<ILayoutsDocument, ILayoutsModel>(
    'layouts',
    loadLayoutsClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
