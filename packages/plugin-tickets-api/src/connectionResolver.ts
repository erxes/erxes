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

import { ITicketModel, loadTicketClass } from "./models/Tickets";
import { IChecklistModel } from "./models/Checklists";
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from "./models/definitions/boards";
import { ITicketDocument } from "./models/definitions/tickets";
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

export interface IModels {
  Boards: IBoardModel;
  Pipelines: IPipelineModel;
  Stages: IStageModel;
  Tickets: ITicketModel;
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
    "tickets_boards",
    loadBoardClass(models, subdomain)
  );

  models.Pipelines = db.model<IPipelineDocument, IPipelineModel>(
    "tickets_pipelines",
    loadPipelineClass(models, subdomain)
  );

  models.Stages = db.model<IStageDocument, IStageModel>(
    "tickets_stages",
    loadStageClass(models, subdomain)
  );
  models.Tickets = db.model<ITicketDocument, ITicketModel>(
    "tickets",
    loadTicketClass(models, subdomain)
  );

  models.Checklists = db.model<IChecklistDocument, IChecklistModel>(
    "tickets_checklists",
    loadChecklistClass(models, subdomain)
  );
  models.ChecklistItems = db.model<IChecklistItemDocument, IChecklistItemModel>(
    "tickets_checklist_items",
    loadItemClass(models, subdomain)
  );
  models.PipelineLabels = db.model<IPipelineLabelDocument, IPipelineLabelModel>(
    "tickets_pipeline_labels",
    loadPipelineLabelClass(models)
  );
  models.PipelineTemplates = db.model<
    IPipelineTemplateDocument,
    IPipelineTemplateModel
  >("tickets_pipeline_templates", loadPipelineTemplateClass(models, subdomain));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
