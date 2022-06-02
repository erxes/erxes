import { IOrderItemDocument } from './models/definitions/orderItems';
import { IOrderDocument } from './models/definitions/orders';
import {
  IProductDocument,
  IProductCategoryDocument
} from './models/definitions/products';
import { IPutResponseDocument } from './models/definitions/putResponses';
import { IQpayInvoiceDocument } from './models/definitions/qpayInvoices';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import {
  loadPosClass,
  loadProductGroupClass,
  IPosModel,
  IProductGroupModel,
  IPosOrderModel,
  loadPosOrderClass
} from './models/Pos';
import { loadOrderItemClass, IOrderItemModel } from './models/OrderItems';
import { loadOrderClass, IOrderModel } from './models/Orders';
import {
  loadProductClass,
  IProductModel,
  IProductCategoryModel,
  loadProductCategoryClass
} from './models/Products';
import { IPutResponseModel, loadPutResponseClass } from './models/PutResponses';
import { IQpayInvoiceModel, loadQPayInvoiceClass } from './models/QPayInvoices';

import {
  IPosDocument,
  IPosOrderDocument,
  IProductGroupDocument
} from './models/definitions/pos';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface IModels {
  Pos: IPosModel;
  ProductGroups: IProductGroupModel;
  PosOrders: IPosOrderModel;
  OrderItems: IOrderItemModel;
  Orders: IOrderModel;
  Products: IProductModel;
  ProductCategories: IProductCategoryModel;
  PutResponses: IPutResponseModel;
  QPayInvoices: IQpayInvoiceModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Pos = db.model<IPosDocument, IPosModel>(
    'pos',
    loadPosClass(models, subdomain)
  );
  models.ProductGroups = db.model<IProductGroupDocument, IProductGroupModel>(
    'product_groups',
    loadProductGroupClass(models, subdomain)
  );

  models.PosOrders = db.model<IPosOrderDocument, IPosOrderModel>(
    'pos_orders',
    loadPosOrderClass(models, subdomain)
  );

  models.OrderItems = db.model<IOrderItemDocument, IOrderItemModel>(
    'order_items',
    loadOrderItemClass(models)
  );

  models.Orders = db.model<IOrderDocument, IOrderModel>(
    'orders',
    loadOrderClass(models)
  );

  models.Products = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(models)
  );

  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >('product_categories', loadProductCategoryClass(models));

  models.PutResponses = db.model<IPutResponseDocument, IPutResponseModel>(
    'put_responses',
    loadPutResponseClass(models)
  );

  models.QPayInvoices = db.model<IQpayInvoiceDocument, IQpayInvoiceModel>(
    'qpay_invoices',
    loadQPayInvoiceClass(models)
  );

  return models;
};
