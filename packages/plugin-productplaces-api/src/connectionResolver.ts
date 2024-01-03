import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;
  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
