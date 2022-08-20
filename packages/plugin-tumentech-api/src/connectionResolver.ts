import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';

import { mainDb } from './configs';
import { IDealPlaceModel, loadDealPlaceClass } from './models/DealPlaces';
import { IDealPlaceDocument } from './models/definitions/dealPlaces';
import { IDirectionDocument } from './models/definitions/directions';
import { IParticipantDocument } from './models/definitions/participants';
import { IPlaceDocument } from './models/definitions/places';
import { IRouteDocument } from './models/definitions/routes';
import { ITripDocument } from './models/definitions/trips';
import {
  ICarCategoryDocument,
  ICarDocument,
  IProductCarCategoryDocument,
  productCarCategorySchema
} from './models/definitions/tumentech';
import { IDirectionModel, loadDirectionClass } from './models/Directions';
import { IParticipantModel, loadParticipantClass } from './models/Participants';
import { IPlaceModel, loadPlaceClass } from './models/Places';
import { IRouteModel, loadRouteClass } from './models/Routes';
import { ITripModel, loadTripClass } from './models/Trips';
import {
  ICarCategoryModel,
  ICarModel,
  IProductCarCategoryModel,
  loadCarCategoryClass,
  loadCarsClass
} from './models/Tumentech';

export interface IModels {
  Cars: ICarModel;
  CarCategories: ICarCategoryModel;
  ProductCarCategories: IProductCarCategoryModel;
  Participants: IParticipantModel;
  Places: IPlaceModel;
  Directions: IDirectionModel;
  Routes: IRouteModel;
  Trips: ITripModel;
  DealPlaces: IDealPlaceModel;
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

  models.Places = db.model<IPlaceDocument, IPlaceModel>(
    'places',
    loadPlaceClass(models)
  );

  models.Directions = db.model<IDirectionDocument, IDirectionModel>(
    'directions',
    loadDirectionClass(models)
  );

  models.Routes = db.model<IRouteDocument, IRouteModel>(
    'routes',
    loadRouteClass(models)
  );

  models.Trips = db.model<ITripDocument, ITripModel>(
    'trips',
    loadTripClass(models)
  );

  models.DealPlaces = db.model<IDealPlaceDocument, IDealPlaceModel>(
    'deal_places',
    loadDealPlaceClass(models)
  );

  return models;
};
