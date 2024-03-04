import {
  IPurchaseHistoryModel,
  loadPurchaseHistoryClass,
} from './models/CustomerPurchaseHistory';
import { ITopupDocument } from './models/definitions/topup';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';
import {
  ICustomerAccountModel,
  loadCustomerAccountClass,
} from './models/CustomerAccount';
import { IDealPlaceModel, loadDealPlaceClass } from './models/DealPlaces';
import { IDealRouteModel, loadDealRouteClass } from './models/DealRoutes';
import { ICustomerAccountDocument } from './models/definitions/customerAccount';
import { IDealPlaceDocument } from './models/definitions/dealPlaces';
import { IDealRouteDocument } from './models/definitions/dealRoutes';
import { IDirectionDocument } from './models/definitions/directions';

import { IParticipantDocument } from './models/definitions/participants';
import { IPlaceDocument } from './models/definitions/places';
import { IRouteDocument } from './models/definitions/routes';
import { ITripDocument } from './models/definitions/trips';
import { ITumentechDealDocument } from './models/definitions/tumentechDeal';
import {
  ICarCategoryDocument,
  ICarDocument,
  IProductCarCategoryDocument,
  productCarCategorySchema,
} from './models/definitions/tumentech';
import { IDirectionModel, loadDirectionClass } from './models/Directions';
import { IParticipantModel, loadParticipantClass } from './models/Participants';
import { IPlaceModel, loadPlaceClass } from './models/Places';
import { IRouteModel, loadRouteClass } from './models/Routes';
import { ITopupModel, loadTopupClass } from './models/Topup';
import { ITripModel, loadTripClass } from './models/Trips';
import {
  ITumentechDealModel,
  loadTrackingClass,
  loadTumentechDealClass,
} from './models/TumentechDeal';
import {
  ICarCategoryModel,
  ICarModel,
  IProductCarCategoryModel,
  loadCarCategoryClass,
  loadCarsClass,
} from './models/Tumentech';
import { IPurchaseHistoryDocument } from './models/definitions/customerPurchaseHistory';
import {
  ITransportDataModel,
  loadTransportDataClass,
} from './models/TransportDatas';
import { ITransportDataDocument } from './models/definitions/transportDatas';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Cars: ICarModel;
  CarCategories: ICarCategoryModel;
  ProductCarCategories: IProductCarCategoryModel;
  Participants: IParticipantModel;
  Places: IPlaceModel;
  Directions: IDirectionModel;
  Routes: IRouteModel;
  Trips: ITripModel;
  TumentechDeals: ITumentechDealModel;
  DealPlaces: IDealPlaceModel;
  DealRoutes: IDealRouteModel;
  CustomerAccounts: ICustomerAccountModel;
  Topups: ITopupModel;
  PurchaseHistories: IPurchaseHistoryModel;
  TransportDatas: ITransportDataModel;
  Tracking: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
}

export let models: IModels;



export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Cars = db.model<ICarDocument, ICarModel>(
    'cars',
    loadCarsClass(models),
  );

  models.CarCategories = db.model<ICarCategoryDocument, ICarCategoryModel>(
    'car_categories',
    loadCarCategoryClass(models),
  );

  models.ProductCarCategories = db.model<
    IProductCarCategoryDocument,
    IProductCarCategoryModel
  >('product_car_category', productCarCategorySchema);

  models.Participants = db.model<IParticipantDocument, IParticipantModel>(
    'participants',
    loadParticipantClass(models),
  );

  models.Places = db.model<IPlaceDocument, IPlaceModel>(
    'places',
    loadPlaceClass(models),
  );

  models.Directions = db.model<IDirectionDocument, IDirectionModel>(
    'directions',
    loadDirectionClass(models),
  );

  models.Routes = db.model<IRouteDocument, IRouteModel>(
    'routes',
    loadRouteClass(models),
  );

  models.Trips = db.model<ITripDocument, ITripModel>(
    'trips',
    loadTripClass(models),
  );

  models.TumentechDeals = db.model<ITumentechDealDocument, ITumentechDealModel>(
    'tumentech_deals',
    loadTumentechDealClass(models),
  );

  models.DealPlaces = db.model<IDealPlaceDocument, IDealPlaceModel>(
    'deal_places',
    loadDealPlaceClass(models),
  );

  models.DealRoutes = db.model<IDealRouteDocument, IDealRouteModel>(
    'deal_routes',
    loadDealRouteClass(models),
  );

  models.CustomerAccounts = db.model<
    ICustomerAccountDocument,
    ICustomerAccountModel
  >('customer_accounts', loadCustomerAccountClass(models));

  models.Topups = db.model<ITopupDocument, ITopupModel>(
    'tumentech_topups',
    loadTopupClass(models),
  );

  models.PurchaseHistories = db.model<
    IPurchaseHistoryDocument,
    IPurchaseHistoryModel
  >('tumentech_purchase_histories', loadPurchaseHistoryClass(models));

  models.TransportDatas = db.model<ITransportDataDocument, ITransportDataModel>(
    'tumentech_transport_datas',
    loadTransportDataClass(models),
  );

  models.Tracking = db.model('tumentech_tracking', loadTrackingClass(models));

  return models;
};

export const generateModels = createGenerateModels(loadClasses);