import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { ICarDocument } from '~/modules/cars/@types/car';

import mongoose from 'mongoose';

import { loadCarClass, ICarModel } from '~/modules/cars/db/models/carModel';
import {
  ICarCategoryModel,
  loadCarCategoryClass,
} from './modules/cars/db/models/categoryModel';
import { ICarCategoryDocument } from './modules/cars/@types/category';

export interface IModels {
  Cars: ICarModel;
  CarCategories: ICarCategoryModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  commonQuerySelector: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Cars = db.model<ICarDocument, ICarModel>('cars', loadCarClass(models));

  models.CarCategories = db.model<ICarCategoryDocument, ICarCategoryModel>(
    'car_categories',
    loadCarCategoryClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
