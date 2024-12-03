import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import {
  loadElementClass,
  loadElementCategoryClass,
  IElementCategoryModel,
  IElementModel,
} from './models/Element';

import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IElementCategoryDocument } from './models/definitions/element';
import { IItineraryModel, loadItineraryClass } from './models/Itinerary';
import { IItineraryDocument } from './models/definitions/itinerary';
import { ITourModel, loadTourClass } from './models/Tour';
import { ITourDocument } from './models/definitions/tour';
import { IOrderModel, loadOrderClass } from './models/Order';
import { IOrderDocument } from './models/definitions/order';

export interface IModels {
  Elements: IElementModel;
  ElementCategories: IElementCategoryModel;
  Itineraries: IItineraryModel;
  Tours: ITourModel;
  Orders: IOrderModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Elements = db.model<IElementModel, IElementModel>(
    'bm_elements',
    loadElementClass(models, subdomain)
  );

  models.ElementCategories = db.model<
    IElementCategoryDocument,
    IElementCategoryModel
  >('bm_element_categories', loadElementCategoryClass(models, subdomain));

  models.Itineraries = db.model<IItineraryDocument, IItineraryModel>(
    'bm_itinerary',
    loadItineraryClass(models, subdomain)
  );

  models.Tours = db.model<ITourDocument, ITourModel>(
    'bm_tours',
    loadTourClass(models, subdomain)
  );

  models.Orders = db.model<IOrderDocument, IOrderModel>(
    'bm_orders',
    loadOrderClass(models, subdomain)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
