import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { createEventDispatcher, EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import mongoose from 'mongoose';

import {
  IBoardDocument,
  IChecklistDocument,
  IChecklistItemDocument,
  IDealDocument,
  IPipelineDocument,
  IPipelineLabelDocument,
  IStageDocument,
} from './modules/sales/@types';
import { IBoardModel, loadBoardClass } from './modules/sales/db/models/Boards';
import {
  IChecklistItemModel,
  IChecklistModel,
  loadCheckListClass,
  loadCheckListItemClass,
} from './modules/sales/db/models/Checklists';
import { IDealModel, loadDealClass } from './modules/sales/db/models/Deals';
import {
  IPipelineLabelModel,
  loadPipelineLabelClass,
} from './modules/sales/db/models/Labels';
import {
  IPipelineModel,
  loadPipelineClass,
} from './modules/sales/db/models/Pipelines';
import { IStageModel, loadStageClass } from './modules/sales/db/models/Stages';

// pos section
import { ICoverDocument } from './modules/pos/@types/covers';
import {
  IPosOrderDocument,
  IPosSlotDocument,
  IProductGroupDocument,
} from './modules/pos/@types/orders';
import { IPosDocument } from './modules/pos/@types/pos';
import { ICoverModel, loadCoverClass } from './modules/pos/db/models/Covers';
import {
  IPosOrderModel,
  loadPosOrderClass,
} from './modules/pos/db/models/Orders';
import {
  IPosModel,
  IPosSlotModel,
  IProductGroupModel,
  loadPosClass,
  loadPosSlotClass,
  loadProductGroupClass,
} from './modules/pos/db/models/Pos';
import { ILoaders } from './modules/sales/graphql/resolvers/loaders';

export interface IModels {
  Boards: IBoardModel;
  Pipelines: IPipelineModel;
  Stages: IStageModel;
  Deals: IDealModel;
  Checklists: IChecklistModel;
  ChecklistItems: IChecklistItemModel;
  PipelineLabels: IPipelineLabelModel;

  // pos section
  Pos: IPosModel;
  ProductGroups: IProductGroupModel;
  PosOrders: IPosOrderModel;
  PosSlots: IPosSlotModel;
  Covers: ICoverModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
  loaders: ILoaders
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
  eventDispatcher: (
    pluginName: string,
    moduleName: string,
    collectionName: string,
  ) => EventDispatcherReturn,
): IModels => {
  const models = {} as IModels;


  // Board model with event dispatcher
  models.Boards = db.model<IBoardDocument, IBoardModel>(
    'sales_boards',
    loadBoardClass(
      models,
      subdomain,
      eventDispatcher('sales', 'board', 'boards'),
    ),
  );

  // Pipeline model with event dispatcher
  models.Pipelines = db.model<IPipelineDocument, IPipelineModel>(
    'sales_pipelines',
    loadPipelineClass(
      models,
      subdomain,
      eventDispatcher('sales', 'pipeline', 'pipelines'),
    ),
  );

  // Stage model with event dispatcher
  models.Stages = db.model<IStageDocument, IStageModel>(
    'sales_stages',
    loadStageClass(
      models,
      subdomain,
      eventDispatcher('sales', 'stage', 'stages'),
    ),
  );

  // Deal model with event dispatcher
  models.Deals = db.model<IDealDocument, IDealModel>(
    'deals',
    loadDealClass(
      models,
      subdomain,
      eventDispatcher('sales', 'deal', 'deals'),
    ),
  );

  // Checklist model with event dispatcher
  models.Checklists = db.model<IChecklistDocument, IChecklistModel>(
    'sales_checklists',
    loadCheckListClass(
      models,
      subdomain,
      eventDispatcher('sales', 'checklist', 'checklists'),
    ),
  );

  // ChecklistItem model with event dispatcher
  models.ChecklistItems = db.model<IChecklistItemDocument, IChecklistItemModel>(
    'sales_checklist_items',
    loadCheckListItemClass(
      models,
      subdomain,
      eventDispatcher('sales', 'checklist', 'checklistItems'),
    ),
  );

  // PipelineLabel model with event dispatcher
  models.PipelineLabels = db.model<IPipelineLabelDocument, IPipelineLabelModel>(
    'sales_pipeline_labels',
    loadPipelineLabelClass(
      models,
      subdomain,
      eventDispatcher('sales', 'pipeline', 'pipelineLabels'),
    ),
  );

  // pos section - without event dispatchers
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
