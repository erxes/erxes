import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IBoardModel,
  IPipelineModel,
  IStageModel,
  loadBoardClass,
  loadPipelineClass,
  loadStageClass,
} from './models/Boards';
import {
  IChecklistItemModel,
  loadClass as loadChecklistClass,
  loadItemClass,
} from './models/Checklists';

import { IGrowthHackModel, loadGrowthHackClass } from './models/GrowthHacks';
import { IChecklistModel } from './models/Checklists';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument,
} from './models/definitions/boards';
import { IGrowthHackDocument } from './models/definitions/growthHacks';
import {
  IChecklistDocument,
  IChecklistItemDocument,
} from './models/definitions/checklists';
import { IPipelineLabelDocument } from './models/definitions/pipelineLabels';
import {
  IPipelineLabelModel,
  loadPipelineLabelClass,
} from './models/PipelineLabels';
import {
  IPipelineTemplateModel,
  loadPipelineTemplateClass,
} from './models/PipelineTemplates';
import { IPipelineTemplateDocument } from './models/definitions/pipelineTemplates';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Boards: IBoardModel;
  Pipelines: IPipelineModel;
  Stages: IStageModel;
  GrowthHacks: IGrowthHackModel;
  Checklists: IChecklistModel;
  ChecklistItems: IChecklistItemModel;
  PipelineLabels: IPipelineLabelModel;
  PipelineTemplates: IPipelineTemplateModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Boards = db.model<IBoardDocument, IBoardModel>(
    'growthhack_boards',
    loadBoardClass(models, subdomain)
  );

  models.Pipelines = db.model<IPipelineDocument, IPipelineModel>(
    'growthhack_pipelines',
    loadPipelineClass(models, subdomain)
  );
  models.Stages = db.model<IStageDocument, IStageModel>(
    'growthhack_stages',
    loadStageClass(models, subdomain)
  );
  models.GrowthHacks = db.model<IGrowthHackDocument, IGrowthHackModel>(
    'growth_hacks',
    loadGrowthHackClass(models, subdomain)
  );
  models.Checklists = db.model<IChecklistDocument, IChecklistModel>(
    'growthhack_checklists',
    loadChecklistClass(models, subdomain)
  );
  models.ChecklistItems = db.model<IChecklistItemDocument, IChecklistItemModel>(
    'growthhack_checklist_items',
    loadItemClass(models, subdomain)
  );
  models.PipelineLabels = db.model<IPipelineLabelDocument, IPipelineLabelModel>(
    'growthhack_pipeline_labels',
    loadPipelineLabelClass(models)
  );
  models.PipelineTemplates = db.model<
    IPipelineTemplateDocument,
    IPipelineTemplateModel
  >(
    'growthhack_pipeline_templates',
    loadPipelineTemplateClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
