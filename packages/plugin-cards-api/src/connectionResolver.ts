import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IBoardModel,
  IPipelineModel,
  IStageModel,
  loadBoardClass,
  loadPipelineClass,
  loadStageClass
} from './models/Boards';
import {
  IChecklistItemModel,
  loadClass as loadChecklistClass,
  loadItemClass
} from './models/Checklists';
import { IDealModel, loadDealClass } from './models/Deals';
import { ITaskModel, loadTaskClass } from './models/Tasks';
import { ITicketModel, loadTicketClass } from './models/Tickets';
import { IGrowthHackModel, loadGrowthHackClass } from './models/GrowthHacks';
import { IChecklistModel } from './models/Checklists';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from './models/definitions/boards';
import { IDealDocument } from './models/definitions/deals';
import { ITaskDocument } from './models/definitions/tasks';
import { ITicketDocument } from './models/definitions/tickets';
import { IGrowthHackDocument } from './models/definitions/growthHacks';
import {
  IChecklistDocument,
  IChecklistItemDocument
} from './models/definitions/checklists';
import { IPipelineLabelDocument } from './models/definitions/pipelineLabels';
import {
  IPipelineLabelModel,
  loadPipelineLabelClass
} from './models/PipelineLabels';
import {
  IPipelineTemplateModel,
  loadPipelineTemplateClass
} from './models/PipelineTemplates';
import { IPipelineTemplateDocument } from './models/definitions/pipelineTemplates';
import { userSchema } from '@erxes/api-utils/src/definitions/users';

export interface ICoreIModels {
  Users;
}

export interface IModels {
  Boards: IBoardModel;
  Pipelines: IPipelineModel;
  Stages: IStageModel;
  Deals: IDealModel;
  Tasks: ITaskModel;
  Tickets: ITicketModel;
  GrowthHacks: IGrowthHackModel;
  Checklists: IChecklistModel;
  ChecklistItems: IChecklistItemModel;
  PipelineLabels: IPipelineLabelModel;
  PipelineTemplates: IPipelineTemplateModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const getSubdomain = (hostname: string): string => {
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
  return coreModels;
};

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

const connectCore = async () => {
  if (coreModels) {
    return coreModels;
  }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  await client.connect();

  console.log('Connected successfully to server');

  coreModels = {
    Users: mainDb.model('users', userSchema)
  };

  return coreModels;
};

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Boards = db.model<IBoardDocument, IBoardModel>(
    'boards',
    loadBoardClass(models, subdomain)
  );
  models.Pipelines = db.model<IPipelineDocument, IPipelineModel>(
    'pipelines',
    loadPipelineClass(models, subdomain)
  );
  models.Stages = db.model<IStageDocument, IStageModel>(
    'stages',
    loadStageClass(models, subdomain)
  );
  models.Deals = db.model<IDealDocument, IDealModel>(
    'deals',
    loadDealClass(models, subdomain)
  );
  models.Tasks = db.model<ITaskDocument, ITaskModel>(
    'tasks',
    loadTaskClass(models, subdomain)
  );
  models.Tickets = db.model<ITicketDocument, ITicketModel>(
    'tickets',
    loadTicketClass(models, subdomain)
  );
  models.GrowthHacks = db.model<IGrowthHackDocument, IGrowthHackModel>(
    'growth_hacks',
    loadGrowthHackClass(models, subdomain)
  );
  models.Checklists = db.model<IChecklistDocument, IChecklistModel>(
    'checklists',
    loadChecklistClass(models, subdomain)
  );
  models.ChecklistItems = db.model<IChecklistItemDocument, IChecklistItemModel>(
    'checklist_items',
    loadItemClass(models, subdomain)
  );
  models.PipelineLabels = db.model<IPipelineLabelDocument, IPipelineLabelModel>(
    'pipeline_labels',
    loadPipelineLabelClass(models)
  );
  models.PipelineTemplates = db.model<
    IPipelineTemplateDocument,
    IPipelineTemplateModel
  >('pipeline_templates', loadPipelineTemplateClass(models, subdomain));

  return models;
};
