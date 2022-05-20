import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { loadConfigClass, IConfigModel } from './models/Configs';
import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ILogModel, loadLogClass } from './models/Logs';
import { IOrderItemModel, loadOrderItemClass } from './models/OrderItems';
import { IOrderModel, loadOrderClass } from './models/Orders';
import { IPosUserModel, loadUserClass } from './models/PosUsers';
import { IProductModel, loadProductClass } from './models/Products';
import { IPutResponseModel, loadPutResponseClass } from './models/PutResponses';
import { IQpayInvoiceModel, loadQPayInvoiceClass } from './models/QPayInvoices';
import { IUserModel, loadUsersClass } from './models/Users';

import { IConfigDocument } from './models/definitions/configs';
import { ICustomerDocument } from './models/definitions/customers';
import { IOrderItemDocument } from './models/definitions/orderItems';
import { IOrderDocument } from './models/definitions/orders';
import { IPosUserDocument } from './models/definitions/posUsers';
import {
  IProductDocument,
  IProductCategoryDocument
} from './models/definitions/products';
import { IPutResponseDocument } from './models/definitions/putResponses';
import { IQpayInvoiceDocument } from './models/definitions/qpayInvoices';

export interface IModels {
  Configs: IConfigModel;
  Customers: ICustomerModel;
  Logs: ILogModel;
  OrderItems: IOrderItemModel;
  Orders: IOrderModel;
  PosUsers: IPosUserModel;
  Products: IProductModel;
  PutResponses: IPutResponseModel;
  QPayInvoices: IQpayInvoiceModel;
  Users: IUserModel;
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

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(models)
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers',
    loadCustomerClass(models)
  );

  models.OrderItems = db.model<IOrderItemDocument, IOrderItemModel>(
    'orderItems',
    loadOrderItemClass(models)
  );

  models.Orders = db.model<IOrderDocument, IOrderModel>(
    'orders',
    loadOrderClass(models)
  );

  models.PosUsers = db.model<IPosUserDocument, IPosUserModel>(
    'posUsers',
    loadUserClass(models)
  );

  models.Products = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(models)
  );

  models.PutResponses = db.model<IPutResponseDocument, IPutResponseModel>(
    'putResponses',
    loadPutResponseClass(models)
  );

  models.QPayInvoices = db.model<IQpayInvoiceDocument, IQpayInvoiceModel>(
    'qpayInvoices',
    loadQPayInvoiceClass(models)
  );

  return models;
};
