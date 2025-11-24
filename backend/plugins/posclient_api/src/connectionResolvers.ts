import {
  IMainContext,
  IProductCategoryDocument,
} from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import * as mongoose from 'mongoose';
import {
  IConfigDocument,
  IProductsConfigDocument,
} from '~/modules/posclient/@types/configs';
import { ICoverDocument } from '~/modules/posclient/@types/cover';
import { IOrderItemDocument } from '~/modules/posclient/@types/orderItems';
import { IOrderDocument } from '~/modules/posclient/@types/orders';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';
import { IProductDocument } from '~/modules/posclient/@types/products';
import { IEbarimtDocument } from '~/modules/posclient/@types/putResponses';
import { IPosSlotDocument } from '~/modules/posclient/@types/slots';
import {
  IConfigModel,
  IProductsConfigModel,
  loadConfigClass,
  loadProductsConfigClass,
} from '~/modules/posclient/db/models/Configs';
import {
  ICoverModel,
  loadCoverClass,
} from '~/modules/posclient/db/models/Covers';
import {
  IOrderItemModel,
  loadOrderItemClass,
} from '~/modules/posclient/db/models/OrderItems';
import {
  IOrderModel,
  loadOrderClass,
} from '~/modules/posclient/db/models/Orders';
import {
  IPosUserModel,
  loadPosUserClass,
} from '~/modules/posclient/db/models/PosUsers';
import {
  IProductModel,
  IProductCategoryModel,
  loadProductClass,
  loadProductCategoryClass,
} from '~/modules/posclient/db/models/Products';
import {
  IPutResponseModel,
  loadPutResponseClass,
} from '~/modules/posclient/db/models/PutResponses';
import {
  IPosSlotModel,
  loadPosSlotClass,
} from '~/modules/posclient/db/models/Slots';

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
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.PosUsers = db.model<IPosUserDocument, IPosUserModel>(
    'posclient_user',
    loadPosUserClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'posclient_configs',
    loadConfigClass(models),
  );

  models.OrderItems = db.model<IOrderItemDocument, IOrderItemModel>(
    'posclient_order_items',
    loadOrderItemClass(models),
  );
  models.Orders = db.model<IOrderDocument, IOrderModel>(
    'posclient_orders',
    loadOrderClass(models),
  );
  models.Products = db.model<IProductDocument, IProductModel>(
    'posclient_products',
    loadProductClass(models),
  );
  models.ProductCategories = db.model<
    IProductCategoryDocument,
    IProductCategoryModel
  >('posclient_product_categories', loadProductCategoryClass(models));

  models.PutResponses = db.model<IEbarimtDocument, IPutResponseModel>(
    'posclient_putresponses',
    loadPutResponseClass(models),
  );
  models.PosSlots = db.model<IPosSlotDocument, IPosSlotModel>(
    'posclient_slots',
    loadPosSlotClass(models),
  );
  models.Covers = db.model<ICoverDocument, ICoverModel>(
    'posclient_covers',
    loadCoverClass(models),
  );
  models.ProductsConfigs = db.model<
    IProductsConfigDocument,
    IProductsConfigModel
  >('posclient_products_configs', loadProductsConfigClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
