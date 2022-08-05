import {
  attachmentSchema,
  boardSchema,
  pipelineSchema,
  stageSchema as boardStageSchema
} from '../../../db/models/definitions/boards';
import {
  brandEmailConfigSchema,
  brandSchema
} from '../../../db/models/definitions/brands';
import { channelSchema } from '../../../db/models/definitions/channels';
import {
  checklistItemSchema,
  checklistSchema
} from '../../../db/models/definitions/checklists';
import { ruleSchema } from '../../../db/models/definitions/common';
import { companySchema } from '../../../db/models/definitions/companies';
import { conversationSchema } from '../../../db/models/definitions/conversations';
import {
  customerSchema,
  locationSchema,
  visitorContactSchema
} from '../../../db/models/definitions/customers';
import {
  dealSchema,
  productCategorySchema,
  productDataSchema,
  productSchema
} from '../../../db/models/definitions/deals';
import { emailTemplateSchema } from '../../../db/models/definitions/emailTemplates';
import {
  emailSchema,
  engageMessageSchema,
  messengerSchema,
  scheduleDateSchema
} from '../../../db/models/definitions/engages';
import { growthHackSchema } from '../../../db/models/definitions/growthHacks';
import { importHistorySchema } from '../../../db/models/definitions/importHistory';
import {
  calloutSchema,
  integrationSchema,
  leadDataSchema
} from '../../../db/models/definitions/integrations';
import { internalNoteSchema } from '../../../db/models/definitions/internalNotes';
import {
  articleSchema,
  categorySchema,
  topicSchema
} from '../../../db/models/definitions/knowledgebase';
import {
  permissionSchema,
  userGroupSchema
} from '../../../db/models/definitions/permissions';
import { pipelineLabelSchema } from '../../../db/models/definitions/pipelineLabels';
import {
  pipelineTemplateSchema,
  stageSchema
} from '../../../db/models/definitions/pipelineTemplates';
import { responseTemplateSchema } from '../../../db/models/definitions/responseTemplates';
import { scriptSchema } from '../../../db/models/definitions/scripts';
import {
  conditionSchema,
  segmentSchema
} from '../../../db/models/definitions/segments';
import { tagSchema } from '../../../db/models/definitions/tags';
import { taskSchema } from '../../../db/models/definitions/tasks';
import { ticketSchema } from '../../../db/models/definitions/tickets';
import { userSchema } from '../../../db/models/definitions/users';
import { MODULE_NAMES } from '../../constants';
import { fetchLogs, getDbSchemaLabels, ILogQueryParams } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';

export interface INameLabel {
  name: string;
  label: string;
}

export interface ISchemaMap {
  name: string;
  schemas: any[];
}

export const LOG_MAPPINGS: ISchemaMap[] = [
  {
    name: MODULE_NAMES.BOARD_DEAL,
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
    name: MODULE_NAMES.PIPELINE_TASK,
    schemas: [pipelineSchema]
  },
  {
    name: MODULE_NAMES.PIPELINE_TICKET,
    schemas: [pipelineSchema]
  },
  {
    name: MODULE_NAMES.BRAND,
    schemas: [brandEmailConfigSchema, brandSchema]
  },
  {
    name: MODULE_NAMES.CHANNEL,
    schemas: [channelSchema]
  },
  {
    name: MODULE_NAMES.CONVERSATION,
    schemas: [conversationSchema]
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
    name: MODULE_NAMES.COMPANY,
    schemas: [companySchema]
  },
  {
    name: MODULE_NAMES.CUSTOMER,
    schemas: [customerSchema, locationSchema, visitorContactSchema]
  },
  {
    name: MODULE_NAMES.DEAL,
    schemas: [dealSchema, productDataSchema]
  },
  {
    name: MODULE_NAMES.EMAIL_TEMPLATE,
    schemas: [emailTemplateSchema]
  },
  {
    name: MODULE_NAMES.IMPORT_HISTORY,
    schemas: [importHistorySchema]
  },
  {
    name: MODULE_NAMES.TAG,
    schemas: [tagSchema]
  },
  {
    name: MODULE_NAMES.RESPONSE_TEMPLATE,
    schemas: [responseTemplateSchema]
  },
  {
    name: MODULE_NAMES.PRODUCT,
    schemas: [productSchema, tagSchema]
  },
  {
    name: MODULE_NAMES.PRODUCT_CATEGORY,
    schemas: [productCategorySchema]
  },
  {
    name: MODULE_NAMES.KB_TOPIC,
    schemas: [topicSchema]
  },
  {
    name: MODULE_NAMES.KB_CATEGORY,
    schemas: [categorySchema]
  },
  {
    name: MODULE_NAMES.KB_ARTICLE,
    schemas: [articleSchema]
  },
  {
    name: MODULE_NAMES.PERMISSION,
    schemas: [permissionSchema]
  },
  {
    name: MODULE_NAMES.USER_GROUP,
    schemas: [userGroupSchema]
  },
  {
    name: MODULE_NAMES.INTERNAL_NOTE,
    schemas: [internalNoteSchema]
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
    name: MODULE_NAMES.INTEGRATION,
    schemas: [calloutSchema, integrationSchema, leadDataSchema, ruleSchema]
  },
  {
    name: MODULE_NAMES.TICKET,
    schemas: [ticketSchema, attachmentSchema]
  },
  {
    name: MODULE_NAMES.SEGMENT,
    schemas: [conditionSchema, segmentSchema]
  },
  {
    name: MODULE_NAMES.ENGAGE,
    schemas: [
      engageMessageSchema,
      emailSchema,
      messengerSchema,
      scheduleDateSchema
    ]
  },
  {
    name: MODULE_NAMES.SCRIPT,
    schemas: [scriptSchema]
  },
  {
    name: MODULE_NAMES.USER,
    schemas: [userSchema]
  },
  {
    name: MODULE_NAMES.STAGE_DEAL,
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

/**
 * Creates field name-label mapping list from given object
 */
export const buildLabelList = (obj = {}): INameLabel[] => {
  const list: INameLabel[] = [];
  const fieldNames: string[] = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field: any = obj[name];
    const label: string = field && field.label ? field.label : '';

    list.push({ name, label });
  }

  return list;
};

const logQueries = {
  /**
   * Fetches logs from logs api server
   */
  logs(_root, params: ILogQueryParams) {
    return fetchLogs(params);
  },

  async getDbSchemaLabels(_root, params: { type: string }) {
    return getDbSchemaLabels(params.type);
  }
};

checkPermission(logQueries, 'logs', 'viewLogs');

export default logQueries;
