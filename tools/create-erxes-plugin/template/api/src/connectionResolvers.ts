import mongoose from 'mongoose';
import { IChangemoduleItemDocument } from './modules/changemodule/db/definitions/items';
import {
  IChangemoduleItemModel,
  loadChangemoduleItemClass,
} from './modules/changemodule/db/models/ChangemoduleItems';
import { createGenerateModels } from 'erxes-api-shared/utils';

export interface IModels {
  ChangemoduleItems: IChangemoduleItemModel;
}

export interface IContext {
  subdomain: string;
  models: IModels;
}

const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  const models = {} as IModels;

  models.ChangemoduleItems = db.model<
    IChangemoduleItemDocument,
    IChangemoduleItemModel
  >(
    'changeme_changemodule',
    loadChangemoduleItemClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
