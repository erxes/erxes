import * as mongoose from 'mongoose';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IConfigDocument,
  IProductsConfigDocument
} from './models/definitions/configs';
import {
  IConfigModel,
  IProductsConfigModel,
  loadConfigClass,
  loadProductsConfigClass
} from './models/Configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IOrderDocument } from './models/definitions/orders';
import { IOrderItemDocument } from './models/definitions/orderItems';
import { IOrderItemModel, loadOrderItemClass } from './models/OrderItems';
import { IOrderModel, loadOrderClass } from './models/Orders';
import { IPosSlotDocument } from './models/definitions/slots';
import { IPosSlotModel, loadPosSlotClass } from './models/Slots';
import { IPosUserDocument } from './models/definitions/posUsers';
import { IPosUserModel, loadPosUserClass } from './models/PosUsers';
import {
  IProductCategoryDocument,
  IProductDocument
} from './models/definitions/products';
import {
  IProductCategoryModel,
  IProductModel,
  loadProductCategoryClass,
  loadProductClass
} from './models/Products';
import { IPutResponseDocument } from './models/definitions/putResponses';
import { IPutResponseModel, loadPutResponseClass } from './models/PutResponses';
import { ICoverModel, loadCoverClass } from './models/Covers';
import { ICoverDocument } from './models/definitions/covers';

export interface IModels {
  Configs: IConfigModel;
  OrderItems: IOrderItemModel;
  Orders: IOrderModel;
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  PutResponses: IPutResponseModel;
  PosUsers: IPosUserModel;
  PosSlots: IPosSlotModel;
  Covers: ICoverModel;
  ProductsConfigs: IProductsConfigModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  posUser: IPosUserDocument;
  config: IConfigDocument;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string
): IModels => {
  models = {} as IModels;

  models.PosUsers = db.model<IPosUserDocument, IPosUserModel>(
    'posclient_user',
    loadPosUserClass(models)
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'posclient_configs',
    loadConfigClass(models)
  );

  models.OrderItems = db.model<IOrderItemDocument, IOrderItemModel>(
    'posclient_order_items',
    loadOrderItemClass(models)
  );
  models.Orders = db.model<IOrderDocument, IOrderModel>(
    'posclient_orders',
    loadOrderClass(models)
  );
  models.Products = db.model<IProductDocument, IProductModel>(
    'posclient_products',
    loadProductClass(models)
  );
  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >('posclient_product_categories', loadProductCategoryClass(models));
  models.PutResponses = db.model<IPutResponseDocument, IPutResponseModel>(
    'posclient_put_responses',
    loadPutResponseClass(models)
  );
  models.PosSlots = db.model<IPosSlotDocument, IPosSlotModel>(
    'posclient_slots',
    loadPosSlotClass(models)
  );
  models.Covers = db.model<ICoverDocument, ICoverModel>(
    'posclient_covers',
    loadCoverClass(models)
  );
  models.ProductsConfigs = db.model<
    IProductsConfigDocument,
    IProductsConfigModel
  >('posclient_products_configs', loadProductsConfigClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
