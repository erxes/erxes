import * as mongoose from "mongoose";
import { IContext as IMainContext } from "@erxes/api-utils/src";
import {
  IBoardModel,
  IPipelineModel,
  IStageModel,
  loadBoardClass,
  loadPipelineClass,
  loadStageClass
} from "./models/Boards";
import {
  IChecklistItemModel,
  loadClass as loadChecklistClass,
  loadItemClass
} from "./models/Checklists";

import { loadExpenseClass } from "./models/Expenses";
import { IPurchaseModel, loadPurchaseClass } from "./models/Purchases";
import { IChecklistModel } from "./models/Checklists";
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from "./models/definitions/boards";
import { IPurchaseDocument } from "./models/definitions/purchases";
import {
  IChecklistDocument,
  IChecklistItemDocument
} from "./models/definitions/checklists";
import { IPipelineLabelDocument } from "./models/definitions/pipelineLabels";
import {
  IPipelineLabelModel,
  loadPipelineLabelClass
} from "./models/PipelineLabels";
import {
  IPipelineTemplateModel,
  loadPipelineTemplateClass
} from "./models/PipelineTemplates";
import { IPipelineTemplateDocument } from "./models/definitions/pipelineTemplates";
import { createGenerateModels } from "@erxes/api-utils/src/core";
import { IExpenseModel } from "./models/Expenses";
import { IExpenseDocument } from "./models/definitions/expenses";

export interface IModels {
  Boards: IBoardModel;
  Pipelines: IPipelineModel;
  Stages: IStageModel;
  Expenses: IExpenseModel;
  Purchases: IPurchaseModel;
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
    "purchases_boards",
    loadBoardClass(models, subdomain)
  );

  models.Expenses = db.model<IExpenseDocument, IExpenseModel>(
    "purchases_expenses",
    loadExpenseClass(models, subdomain)
  );

  models.Pipelines = db.model<IPipelineDocument, IPipelineModel>(
    "purchases_pipelines",
    loadPipelineClass(models, subdomain)
  );

  models.Stages = db.model<IStageDocument, IStageModel>(
    "purchases_stages",
    loadStageClass(models, subdomain)
  );
  models.Purchases = db.model<IPurchaseDocument, IPurchaseModel>(
    "purchases",
    loadPurchaseClass(models, subdomain)
  );

  models.Checklists = db.model<IChecklistDocument, IChecklistModel>(
    "purchases_checklists",
    loadChecklistClass(models, subdomain)
  );
  models.ChecklistItems = db.model<IChecklistItemDocument, IChecklistItemModel>(
    "purchases_checklist_items",
    loadItemClass(models, subdomain)
  );
  models.PipelineLabels = db.model<IPipelineLabelDocument, IPipelineLabelModel>(
    "purchases_pipeline_labels",
    loadPipelineLabelClass(models)
  );
  models.PipelineTemplates = db.model<
    IPipelineTemplateDocument,
    IPipelineTemplateModel
  >(
    "purchases_pipeline_templates",
    loadPipelineTemplateClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
