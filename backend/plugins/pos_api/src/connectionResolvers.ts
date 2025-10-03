import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import * as mongoose from 'mongoose';
import { ICoverDocument } from './modules/pos/@types/covers';
import { IPosOrderDocument, IPosSlotDocument, IProductGroupDocument } from './modules/pos/@types/orders';
import { IPosDocument } from './modules/pos/@types/pos';
import { ICoverModel, loadCoverClass } from './modules/pos/db/models/Covers';
import { IPosOrderModel, loadPosOrderClass } from './modules/pos/db/models/Orders';
import { IPosModel, IPosSlotModel, IProductGroupModel, loadPosClass, loadPosSlotClass, loadProductGroupClass } from './modules/pos/db/models/Pos';

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

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.Pos = db.model<IPosDocument, IPosModel>(
    'pos',
    loadPosClass(models, subdomain),
  );
  models.ProductGroups = db.model<IProductGroupDocument, IProductGroupModel>(
    'product_groups',
    loadProductGroupClass(models, subdomain),
  );

  models.PosOrders = db.model<IPosOrderDocument, IPosOrderModel>(
    'pos_orders',
    loadPosOrderClass(models, subdomain),
  );
  models.PosSlots = db.model<IPosSlotDocument, IPosSlotModel>(
    'pos_slots',
    loadPosSlotClass(models, subdomain),
  );
  models.Covers = db.model<ICoverDocument, ICoverModel>(
    'pos_covers',
    loadCoverClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
