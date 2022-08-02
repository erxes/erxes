import * as mongoose from 'mongoose';
import {
  loadPosClass,
  loadProductGroupClass,
  IPosModel,
  IProductGroupModel,
  IPosOrderModel,
  loadPosOrderClass,
  IPosSlotModel,
  loadPosSlotClass
} from './models/Pos';

import {
  IPosDocument,
  IPosOrderDocument,
  IPosSlotDocument,
  IProductGroupDocument
} from './models/definitions/pos';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Pos: IPosModel;
  ProductGroups: IProductGroupModel;
  PosOrders: IPosOrderModel;
  PosSlots: IPosSlotModel;
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

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
