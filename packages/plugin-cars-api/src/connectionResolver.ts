import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { ICarCategoryDocument, ICarDocument } from './models/definitions/cars';
import {
  loadCarClass,
  loadCarCategoryClass,
  ICarCategoryModel,
  ICarModel
} from './models/Cars';
import { MongoClient } from 'mongodb';

export interface IModels {
  Cars: ICarModel;
  CarCategories: ICarCategoryModel;
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

  models.Cars = db.model<ICarDocument, ICarModel>('cars', loadCarClass(models));

  models.CarCategories = db.model<ICarCategoryDocument, ICarCategoryModel>(
    'car_categories',
    loadCarCategoryClass(models)
  );

  return models;
};
