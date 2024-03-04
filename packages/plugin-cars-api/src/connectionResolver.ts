import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ICarCategoryDocument, ICarDocument } from './models/definitions/cars';
import {
  loadCarClass,
  loadCarCategoryClass,
  ICarCategoryModel,
  ICarModel,
} from './models/Cars';
import { MongoClient } from 'mongodb';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Cars: ICarModel;
  CarCategories: ICarCategoryModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Cars = db.model<ICarDocument, ICarModel>('cars', loadCarClass(models));

  models.CarCategories = db.model<ICarCategoryDocument, ICarCategoryModel>(
    'car_categories',
    loadCarCategoryClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
