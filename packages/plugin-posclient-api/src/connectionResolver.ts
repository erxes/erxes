import * as mongoose from 'mongoose';
import { IPosUserDocument } from './models/definitions/posUsers';
import { IPosUserModel, loadPosUserClass } from './models/PosUsers';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { IConfigModel, loadConfigClass } from './models/Configs';
import { ILogModel } from './models/Logs';
import { IOrderItemModel, loadOrderItemClass } from './models/OrderItems';
import { IOrderModel, loadOrderClass } from './models/Orders';
import {
  IProductModel,
  loadProductClass,
  IProductCategoryModel,
  loadProductCategoryClass
} from './models/Products';
import { IPutResponseModel, loadPutResponseClass } from './models/PutResponses';
import { IQpayInvoiceModel, loadQPayInvoiceClass } from './models/QPayInvoices';

import { IConfigDocument } from './models/definitions/configs';
import { IOrderItemDocument } from './models/definitions/orderItems';
import { IOrderDocument } from './models/definitions/orders';
import {
  IProductDocument,
  IProductCategoryDocument
} from './models/definitions/products';
import { IPutResponseDocument } from './models/definitions/putResponses';
import { IQpayInvoiceDocument } from './models/definitions/qpayInvoices';

export interface IModels {
  Configs: IConfigModel;
  Logs: ILogModel;
  OrderItems: IOrderItemModel;
  Orders: IOrderModel;
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  PutResponses: IPutResponseModel;
  QPayInvoices: IQpayInvoiceModel;
  PosUsers: IPosUserModel;
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
  models.QPayInvoices = db.model<IQpayInvoiceDocument, IQpayInvoiceModel>(
    'posclient_qpay_invoices',
    loadQPayInvoiceClass(models)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
