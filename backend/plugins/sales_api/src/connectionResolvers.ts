import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

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

export interface IModels {
  Boards: IBoardModel;
  Pipelines: IPipelineModel;
  Stages: IStageModel;
  Deals: IDealModel;
  Checklists: IChecklistModel;
  ChecklistItems: IChecklistItemModel;
  PipelineLabels: IPipelineLabelModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Boards = db.model<IBoardDocument, IBoardModel>(
    'sales_boards',
    loadBoardClass(models),
  );

  models.Pipelines = db.model<IPipelineDocument, IPipelineModel>(
    'sales_pipelines',
    loadPipelineClass(models),
  );

  models.Stages = db.model<IStageDocument, IStageModel>(
    'sales_stages',
    loadStageClass(models),
  );

  models.Deals = db.model<IDealDocument, IDealModel>(
    'deals',
    loadDealClass(models),
  );

  models.Checklists = db.model<IChecklistDocument, IChecklistModel>(
    'sales_checklists',
    loadCheckListClass(models),
  );

  models.ChecklistItems = db.model<IChecklistItemDocument, IChecklistItemModel>(
    'sales_checklist_items',
    loadCheckListItemClass(models),
  );

  models.PipelineLabels = db.model<IPipelineLabelDocument, IPipelineLabelModel>(
    'sales_pipeline_labels',
    loadPipelineLabelClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
