import {
  attachmentSchema,
  boardSchema,
  stageSchema as boardStageSchema,
  pipelineSchema
} from './models/definitions/boards';
import {
  checklistItemSchema,
  checklistSchema
} from './models/definitions/checklists';
import { dealSchema, productDataSchema } from './models/definitions/deals';
import {
  purchaseSchema,
  purchaseproductDataSchema
} from './models/definitions/purchases';
import {
  pipelineTemplateSchema,
  stageSchema
} from './models/definitions/pipelineTemplates';

import { growthHackSchema } from './models/definitions/growthHacks';
import { pipelineLabelSchema } from './models/definitions/pipelineLabels';
import { taskSchema } from './models/definitions/tasks';
import { ticketSchema } from './models/definitions/tickets';

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Deal',
    contentType: 'deal',
    icon: 'signal-alt-3'
  },
  {
    text: 'Purchase',
    contentTypeL: 'purchase',
    icon: 'signal-alt-3'
  },
  {
    text: 'Task',
    contentType: 'task',
    icon: 'laptop'
  },
  {
    text: 'Ticket',
    contentType: 'ticket',
    icon: 'ticket'
  }
];
export const PRIORITIES = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  NORMAL: 'Normal',
  LOW: 'Low',
  ALL: [
    {
      name: 'Critical',
      color: '#EA475D'
    },
    { name: 'High', color: '#F7CE53' },
    { name: 'Normal', color: '#3B85F4' },
    { name: 'Low', color: '#AAAEB3' }
  ]
};

export const CLOSE_DATE_TYPES = {
  NEXT_DAY: 'nextDay',
  NEXT_WEEK: 'nextWeek',
  NEXT_MONTH: 'nextMonth',
  NO_CLOSE_DATE: 'noCloseDate',
  OVERDUE: 'overdue',
  ALL: [
    {
      name: 'Next day',
      value: 'nextDay'
    },
    {
      name: 'Next week',
      value: 'nextWeek'
    },
    {
      name: 'Next month',
      value: 'nextMonth'
    },
    {
      name: 'No close date',
      value: 'noCloseDate'
    },
    {
      name: 'Over due',
      value: 'overdue'
    }
  ]
};

export const BOARD_ITEM_EXTENDED_FIELDS = [
  {
    _id: Math.random(),
    name: 'boardName',
    label: 'Board name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'pipelineName',
    label: 'Pipeline name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'stageName',
    label: 'Stage name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'assignedUserEmail',
    label: 'Assigned user email',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'labelIds',
    label: 'Label',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'totalAmount',
    label: 'Total Amount',
    type: 'number'
  }
];

export const BOARD_ITEM_EXPORT_EXTENDED_FIELDS = [
  {
    _id: Math.random(),
    name: 'totalAmount',
    label: 'Total Amount',
    type: 'number'
  },
  {
    _id: Math.random(),
    name: 'totalLabelCount',
    label: 'Total Label Counts',
    type: 'number'
  },
  {
    _id: Math.random(),
    name: 'stageMovedUser',
    label: 'Stage Moved User',
    type: 'string'
  }
];

export const BOARD_BASIC_INFOS = [
  'userId',
  'createdAt',
  'order',
  'name',
  'closeDate',
  'reminderMinute',
  'isComplete',
  'description',
  'assignedUsers',
  'watchedUserIds',
  'labelIds',
  'stageId',
  'initialStageId',
  'modifiedAt',
  'modifiedBy',
  'priority'
];

export const MODULE_NAMES = {
  BOARD: 'board',
  BOARD_DEAL: 'dealBoards',
  BOARD_PURCHASE: 'purchaseBoards',
  BOARD_TASK: 'taskBoards',
  BOARD_TICKET: 'ticketBoards',
  BOARD_GH: 'growthHackBoards',
  PIPELINE_DEAL: 'dealPipelines',
  PIPELINE_PURCHASE: 'purchasePipelines',
  PIPELINE_TASK: 'taskPipelines',
  PIPELINE_TICKET: 'ticketPipelines',
  PIPELINE_GH: 'growthHackPipelines',
  STAGE_DEAL: 'dealStages',
  STAGE_PURCHASE: 'purchaseStages',
  STAGE_TASK: 'taskStages',
  STAGE_TICKET: 'ticketStages',
  STAGE_GH: 'growthHackStages',
  CHECKLIST: 'checklist',
  CHECKLIST_ITEM: 'checkListItem',
  DEAL: 'deal',
  PURCHASE: 'purchase',
  TICKET: 'ticket',
  TASK: 'task',
  PIPELINE_LABEL: 'pipelineLabel',
  PIPELINE_TEMPLATE: 'pipelineTemplate',
  GROWTH_HACK: 'growthHack'
};

interface ISchemaMap {
  name: string;
  schemas: any[];
}

export const LOG_MAPPINGS: ISchemaMap[] = [
  {
    name: MODULE_NAMES.BOARD_DEAL,
    schemas: [attachmentSchema, boardSchema]
  },
  {
    name: MODULE_NAMES.BOARD_PURCHASE,
    schemas: [attachmentSchema, boardSchema]
  },
  {
    name: MODULE_NAMES.BOARD_TASK,
    schemas: [attachmentSchema, boardSchema]
  },
  {
    name: MODULE_NAMES.BOARD_TICKET,
    schemas: [attachmentSchema, boardSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_DEAL,
    schemas: [pipelineSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_PURCHASE,
    schemas: [pipelineSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_TASK,
    schemas: [pipelineSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_TICKET,
    schemas: [pipelineSchema]
  },
  {
    name: MODULE_NAMES.CHECKLIST,
    schemas: [checklistSchema]
  },
  {
    name: MODULE_NAMES.CHECKLIST_ITEM,
    schemas: [checklistItemSchema]
  },
  {
    name: MODULE_NAMES.DEAL,
    schemas: [dealSchema, productDataSchema]
  },
  {
    name: MODULE_NAMES.PURCHASE,
    schemas: [purchaseSchema, purchaseproductDataSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_LABEL,
    schemas: [pipelineLabelSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_TEMPLATE,
    schemas: [pipelineTemplateSchema, stageSchema]
  },
  {
    name: MODULE_NAMES.TASK,
    schemas: [taskSchema, attachmentSchema]
  },
  {
    name: MODULE_NAMES.GROWTH_HACK,
    schemas: [growthHackSchema, attachmentSchema]
  },
  {
    name: MODULE_NAMES.TICKET,
    schemas: [ticketSchema, attachmentSchema]
  },
  {
    name: MODULE_NAMES.STAGE_DEAL,
    schemas: [boardStageSchema]
  },
  {
    name: MODULE_NAMES.STAGE_PURCHASE,
    schemas: [boardStageSchema]
  },
  {
    name: MODULE_NAMES.STAGE_TASK,
    schemas: [boardStageSchema]
  },
  {
    name: MODULE_NAMES.STAGE_TICKET,
    schemas: [boardStageSchema]
  },
  {
    name: MODULE_NAMES.STAGE_GH,
    schemas: [boardStageSchema]
  }
];

export const CARD_PROPERTIES_INFO = {
  priority: 'Priority',

  ALL: [
    {
      label: 'Priority',
      field: 'priority',
      canHide: false,
      validation: null,
      type: 'select',
      options: ['Critical', 'High', 'Normal', 'Low']
    },
    {
      label: 'Label',
      field: 'labelIds',
      canHide: false,
      validation: null,
      type: 'select',
      options: []
    },
    {
      label: 'Start date',
      field: 'startDate',
      canHide: false,
      validation: 'date',
      type: 'input'
    },
    {
      label: 'Close date',
      field: 'closeDate',
      canHide: false,
      validation: 'date',
      type: 'input'
    },
    {
      label: 'Assigned to',
      field: 'assignedUserIds',
      canHide: false,
      validation: null,
      type: 'select',
      options: []
    },
    {
      label: 'Attachments',
      field: 'attachments',
      canHide: false,
      type: 'file'
    },
    {
      label: 'Description',
      field: 'description',
      canHide: false,
      validation: null,
      type: 'textarea'
    }
  ]
};
