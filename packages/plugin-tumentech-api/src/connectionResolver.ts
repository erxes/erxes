import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  ICarDocument,
  ICarCategoryDocument,
  IProductCarCategoryDocument,
  productCarCategorySchema
} from './models/definitions/tumentech';
import {
  loadCarsClass,
  loadCarCategoryClass,
  ICarModel,
  ICarCategoryModel,
  IProductCarCategoryModel
} from './models/Tumentech';

import { IParticipantDocument } from './models/definitions/participants';
import { IParticipantModel, loadParticipantClass } from './models/Participants';

export interface IModels {
  Cars: ICarModel;
  CarCategories: ICarCategoryModel;
  ProductCarCategories: IProductCarCategoryModel;
  Participants: IParticipantModel;
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

  models.Cars = db.model<ICarDocument, ICarModel>(
    'cars',
    loadCarsClass(models)
  );

  models.CarCategories = db.model<ICarCategoryDocument, ICarCategoryModel>(
    'car_categories',
    loadCarCategoryClass(models)
  );

  models.ProductCarCategories = db.model<
    IProductCarCategoryDocument,
    IProductCarCategoryModel
  >('product_car_category', productCarCategorySchema);

  models.Participants = db.model<IParticipantDocument, IParticipantModel>(
    'participants',
    loadParticipantClass(models)
  );

  return models;
};
