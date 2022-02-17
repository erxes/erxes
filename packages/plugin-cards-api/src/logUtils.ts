import { Forms, Users } from './apiCollections';
import { Boards, PipelineLabels, Pipelines, Stages } from './models';
import {
  IPipelineDocument,
  IStageDocument,
  attachmentSchema,
  boardSchema,
  pipelineSchema,
  stageSchema as boardStageSchema
} from './models/definitions/boards';
import { checklistSchema, checklistItemSchema } from './models/definitions/checklists';
import { IDealDocument, dealSchema, productDataSchema } from './models/definitions/deals';
import { IGrowthHackDocument, growthHackSchema } from './models/definitions/growthHacks';
import { IPipelineTemplateDocument, pipelineTemplateSchema, stageSchema } from './models/definitions/pipelineTemplates';
import { pipelineLabelSchema } from './models/definitions/pipelineLabels';
import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog,
  putActivityLog as commonPutActivityLog,
  LogDesc,
  gatherNames,
  gatherUsernames,
  IDescriptions,
  buildLabelList
} from '@erxes/api-utils/src/logUtils';
import { ITaskDocument, taskSchema } from './models/definitions/tasks';
import { ITicketDocument, ticketSchema } from './models/definitions/tickets';
import messageBroker from './messageBroker';
import { MODULE_NAMES } from './constants';

interface ISchemaMap {
  name: string;
  schemas: any[];
}

interface INameLabel {
  name: string;
  label: string;
}

const LOG_MAPPINGS: ISchemaMap[] = [
  {
    name: MODULE_NAMES.BOARD_DEAL,
    schemas: [attachmentSchema, boardSchema],
  },
  {
    name: MODULE_NAMES.BOARD_TASK,
    schemas: [attachmentSchema, boardSchema],
  },
  {
    name: MODULE_NAMES.BOARD_TICKET,
    schemas: [attachmentSchema, boardSchema],
  },
  {
    name: MODULE_NAMES.PIPELINE_DEAL,
    schemas: [pipelineSchema],
  },
  {
    name: MODULE_NAMES.PIPELINE_TASK,
    schemas: [pipelineSchema],
  },
  {
    name: MODULE_NAMES.PIPELINE_TICKET,
    schemas: [pipelineSchema],
  },
  {
    name: MODULE_NAMES.CHECKLIST,
    schemas: [checklistSchema],
  },
  {
    name: MODULE_NAMES.CHECKLIST_ITEM,
    schemas: [checklistItemSchema],
  },
  {
    name: MODULE_NAMES.DEAL,
    schemas: [dealSchema, productDataSchema],
  },
  {
    name: MODULE_NAMES.PIPELINE_LABEL,
    schemas: [pipelineLabelSchema],
  },
  {
    name: MODULE_NAMES.PIPELINE_TEMPLATE,
    schemas: [pipelineTemplateSchema, stageSchema],
  },
  {
    name: MODULE_NAMES.TASK,
    schemas: [taskSchema, attachmentSchema],
  },
  {
    name: MODULE_NAMES.GROWTH_HACK,
    schemas: [growthHackSchema, attachmentSchema],
  },
  {
    name: MODULE_NAMES.TICKET,
    schemas: [ticketSchema, attachmentSchema],
  },
  {
    name: MODULE_NAMES.STAGE_DEAL,
    schemas: [boardStageSchema],
  },
  {
    name: MODULE_NAMES.STAGE_TASK,
    schemas: [boardStageSchema],
  },
  {
    name: MODULE_NAMES.STAGE_TICKET,
    schemas: [boardStageSchema],
  },
  {
    name: MODULE_NAMES.STAGE_GH,
    schemas: [boardStageSchema],
  },
];

type BoardItemDocument = IDealDocument | ITaskDocument | ITicketDocument | IGrowthHackDocument;

const gatherPipelineFieldNames = async (
  doc: IPipelineDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherNames({
    collection: Boards,
    idFields: [doc.boardId],
    foreignKey: 'boardId',
    nameFields: ['name'],
    prevList: options
  });

  if (doc.userId) {
    options = await gatherUsernames({
      collection: Users,
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }

  if (doc.excludeCheckUserIds && doc.excludeCheckUserIds.length > 0) {
    options = await gatherUsernames({
      collection: Users,
      idFields: doc.excludeCheckUserIds,
      foreignKey: 'excludeCheckUserIds',
      prevList: options
    });
  }

  if (doc.memberIds && doc.memberIds.length > 0) {
    options = await gatherUsernames({
      collection: Users,
      idFields: doc.memberIds,
      foreignKey: 'memberIds',
      prevList: options
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      collection: Users,
      idFields: doc.watchedUserIds,
      foreignKey: 'watchedUserIds',
      prevList: options
    });
  }

  return options;
};

const gatherBoardItemFieldNames = async (
  doc: BoardItemDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherUsernames({
      collection: Users,
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }

  if (doc.assignedUserIds && doc.assignedUserIds.length > 0) {
    options = await gatherUsernames({
      collection: Users,
      idFields: doc.assignedUserIds,
      foreignKey: 'assignedUserIds',
      prevList: options
    });
  }

  if (doc.watchedUserIds && doc.watchedUserIds.length > 0) {
    options = await gatherUsernames({
      collection: Users,
      idFields: doc.watchedUserIds,
      foreignKey: 'watchedUserIds',
      prevList: options
    });
  }

  if (doc.labelIds && doc.labelIds.length > 0) {
    options = await gatherNames({
      collection: PipelineLabels,
      idFields: doc.labelIds,
      foreignKey: 'labelIds',
      prevList: options,
      nameFields: ['name']
    });
  }

  options = await gatherNames({
    collection: Stages,
    idFields: [doc.stageId],
    foreignKey: 'stageId',
    prevList: options,
    nameFields: ['name']
  });

  if (doc.initialStageId) {
    options = await gatherNames({
      collection: Stages,
      idFields: [doc.initialStageId],
      foreignKey: 'initialStageId',
      prevList: options,
      nameFields: ['name']
    });
  }

  if (doc.modifiedBy) {
    options = await gatherUsernames({
      collection: Users,
      idFields: [doc.modifiedBy],
      foreignKey: 'modifiedBy',
      prevList: options
    });
  }

  return options;
};

const gatherDealFieldNames = async (
  doc: IDealDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(doc, options);

  // if (doc.productsData && doc.productsData.length > 0) {
  //   options = await gatherNames({
  //     collection: Products,
  //     idFields: doc.productsData.map(p => p.productId),
  //     foreignKey: 'productId',
  //     prevList: options,
  //     nameFields: ['name']
  //   });
  // }

  return options;
};

const gatherGHFieldNames = async (
  doc: IGrowthHackDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherBoardItemFieldNames(doc, options);

  if (doc.votedUserIds && doc.votedUserIds.length > 0) {
    options = await gatherUsernames({
      collection: Users,
      idFields: doc.votedUserIds,
      foreignKey: 'votedUserIds',
      prevList: options
    });
  }

  return options;
};

const gatherPipelineTemplateFieldNames = async (
  doc: IPipelineTemplateDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  options = await gatherUsernames({
    collection: Users,
    idFields: [doc.createdBy || ''],
    foreignKey: 'createdBy',
    prevList: options
  });

  if (doc.stages && doc.stages.length > 0) {
    options = await gatherNames({
      collection: Forms,
      idFields: doc.stages.map(s => s.formId),
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title']
    });
  }

  return options;
};

const gatherStageFieldNames = async (
  doc: IStageDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.userId) {
    options = await gatherUsernames({
      collection: Users,
      idFields: [doc.userId],
      foreignKey: 'userId',
      prevList: options
    });
  }
  if (doc.pipelineId) {
    options = await gatherNames({
      collection: Pipelines,
      idFields: [doc.pipelineId],
      foreignKey: 'pipelineId',
      prevList: options,
      nameFields: ['name']
    });
  }
  if (doc.formId) {
    options = await gatherNames({
      collection: Forms,
      idFields: [doc.formId],
      foreignKey: 'formId',
      prevList: options,
      nameFields: ['title']
    });
  }

  return options;
};

const gatherDescriptions = async (params: any): Promise<IDescriptions> => {
  const { action, type, object, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.BOARD_DEAL:
    case MODULE_NAMES.BOARD_GH:
    case MODULE_NAMES.BOARD_TASK:
    case MODULE_NAMES.BOARD_TICKET:
      if (object.userId) {
        extraDesc = await gatherUsernames({
          collection: Users,
          idFields: [object.userId],
          foreignKey: 'userId'
        });
      }

      description = `"${object.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.PIPELINE_DEAL:
    case MODULE_NAMES.PIPELINE_GH:
    case MODULE_NAMES.PIPELINE_TASK:
    case MODULE_NAMES.PIPELINE_TICKET:
      extraDesc = await gatherPipelineFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherPipelineFieldNames(updatedDocument, extraDesc);
      }

      description = `"${object.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.DEAL:
      description = `"${object.name}" has been ${action}d`;
      extraDesc = await gatherDealFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherDealFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.GROWTH_HACK:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherGHFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherGHFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.PIPELINE_LABEL:
      description = `"${object.name}" has been ${action}d`;

      const pipeline = await Pipelines.findOne({ _id: object.pipelineId });

      extraDesc = await gatherUsernames({
        collection: Users,
        idFields: [object.createdBy],
        foreignKey: 'createdBy'
      });

      if (pipeline) {
        extraDesc.push({ pipelineId: pipeline._id, name: pipeline.name });
      }

      break;
    case MODULE_NAMES.PIPELINE_TEMPLATE:
      extraDesc = await gatherPipelineTemplateFieldNames(object);

      description = `"${object.name}" has been created`;

      if (updatedDocument) {
        extraDesc = await gatherPipelineTemplateFieldNames(
          updatedDocument,
          extraDesc
        );
      }

      break;
    case MODULE_NAMES.TASK:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.TICKET:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherBoardItemFieldNames(object);

      if (updatedDocument) {
        extraDesc = await gatherBoardItemFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.STAGE_DEAL:
    case MODULE_NAMES.STAGE_TASK:
    case MODULE_NAMES.STAGE_TICKET:
    case MODULE_NAMES.STAGE_GH:
      description = `"${object.name}" has been ${action}d`;

      extraDesc = await gatherStageFieldNames(object, extraDesc);

      if (updatedDocument) {
        extraDesc = await gatherStageFieldNames(updatedDocument, extraDesc);
      }

      break;

    default:
      break;
  }

  return { extraDesc, description };
};

export const putDeleteLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(logDoc);

  await commonPutDeleteLog(
    messageBroker(),
    { ...logDoc, description, extraDesc },
    user
  );
};

export const putUpdateLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(logDoc);

  await commonPutUpdateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc },
    user
  );
};

export const putCreateLog = async (logDoc, user) => {
  const { description, extraDesc } = await gatherDescriptions(logDoc);

  await commonPutCreateLog(
    messageBroker(),
    { ...logDoc, description, extraDesc },
    user
  );
};

export const putActivityLog = async (params: { action: string, data: any }) => {
  // const { action, data } = params;

  // if (['createBoardItemMovementLog'].includes(action)) {
  //   await sendToWebhook(action, data.contentType, params);
  // }

  return commonPutActivityLog({ messageBroker: messageBroker(), ...params });
};

export const getSchemaLabels = (type: string) => {
  let fieldNames: INameLabel[] = [];

  const found: ISchemaMap | undefined = LOG_MAPPINGS.find(
    (m) => m.name === type
  );

  if (found) {
    const schemas: any = found.schemas || [];

    for (const schema of schemas) {
      // schema comes as either mongoose schema or plain object
      const names: string[] = Object.getOwnPropertyNames(
        schema.obj || schema
      );

      for (const name of names) {
        const field: any = schema.obj ? schema.obj[name] : schema[name];

        if (field && field.label) {
          fieldNames.push({ name, label: field.label });
        }

        // nested object field names
        if (typeof field === "object" && field.type && field.type.obj) {
          fieldNames = fieldNames.concat(buildLabelList(field.type.obj));
        }
      }
    } // end schema for loop
  } // end schema name mapping

  return fieldNames;
};
