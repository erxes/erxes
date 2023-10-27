import * as mongoose from 'mongoose';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IPosDocument,
  IPosSlotDocument,
  IProductGroupDocument
} from './models/definitions/pos';
import {
  IPosModel,
  IPosSlotModel,
  IProductGroupModel,
  loadPosClass,
  loadPosSlotClass,
  loadProductGroupClass
} from './models/Pos';
import { IPosOrderModel, loadPosOrderClass } from './models/Orders';
import { ICoverModel, loadCoverClass } from './models/Covers';
import { ICoverDocument } from './models/definitions/covers';
import { IPosOrderDocument } from './models/definitions/orders';

export interface IModels {
  Pos: IPosModel;
  ProductGroups: IProductGroupModel;
  PosOrders: IPosOrderModel;
  PosSlots: IPosSlotModel;
  Covers: ICoverModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

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
  models.PosSlots = db.model<IPosSlotDocument, IPosSlotModel>(
    'pos_slots',
    loadPosSlotClass(models, subdomain)
  );
  models.Covers = db.model<ICoverDocument, ICoverModel>(
    'pos_covers',
    loadCoverClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
