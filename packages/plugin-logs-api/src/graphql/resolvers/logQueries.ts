// import {
//   attachmentSchema,
//   boardSchema,
//   pipelineSchema,
//   stageSchema as boardStageSchema,
// } from "../../../db/models/definitions/boards";
// import {
//   brandEmailConfigSchema,
//   brandSchema,
// } from "../../../db/models/definitions/brands";
// import { channelSchema } from "../../../db/models/definitions/channels";
// import {
//   checklistItemSchema,
//   checklistSchema,
// } from "../../../db/models/definitions/checklists";
// import { ruleSchema } from "../../../db/models/definitions/common";
// import { companySchema } from "../../../db/models/definitions/companies";
// import { conversationSchema } from "../../../db/models/definitions/conversations";
// import {
//   customerSchema,
//   locationSchema,
//   visitorContactSchema,
// } from "../../../db/models/definitions/customers";
// import {
//   dealSchema,
//   productCategorySchema,
//   productDataSchema,
//   productSchema,
// } from "../../../db/models/definitions/deals";
// import { emailTemplateSchema } from "../../../db/models/definitions/emailTemplates";
// import {
//   emailSchema,
//   engageMessageSchema,
//   messengerSchema,
//   scheduleDateSchema,
// } from "../../../db/models/definitions/engages";
// import { growthHackSchema } from "../../../db/models/definitions/growthHacks";
// import { importHistorySchema } from "../../../db/models/definitions/importHistory";
// import {
//   calloutSchema,
//   integrationSchema,
//   leadDataSchema,
// } from "../../../db/models/definitions/integrations";
// import { internalNoteSchema } from "../../../db/models/definitions/internalNotes";
// import {
//   articleSchema,
//   categorySchema,
//   topicSchema,
// } from "../../../db/models/definitions/knowledgebase";
// import {
//   permissionSchema,
//   userGroupSchema,
// } from "../../../db/models/definitions/permissions";
// import { pipelineLabelSchema } from "../../../db/models/definitions/pipelineLabels";
// import {
//   pipelineTemplateSchema,
//   stageSchema,
// } from "../../../db/models/definitions/pipelineTemplates";
// import { responseTemplateSchema } from "../../../db/models/definitions/responseTemplates";
// import { scriptSchema } from "../../../db/models/definitions/scripts";
// import {
//   conditionSchema,
//   segmentSchema,
// } from "../../../db/models/definitions/segments";
// import { tagSchema } from "../../../db/models/definitions/tags";
// import { taskSchema } from "../../../db/models/definitions/tasks";
// import { ticketSchema } from "../../../db/models/definitions/tickets";
// import { userSchema } from "../../../db/models/definitions/users";
import { MAPPED_MODULE_NAMES } from "../../constants";
// import { fetchLogs, ILogQueryParams } from "../../logUtils";
import { checkPermission } from '@erxes/api-utils/src/permissions';
import Logs from '../../models/Logs';
import { getDbSchemaLabels } from '../../messageBroker';

interface ICommonParams {
  action?: string | { $in: string[] };
  type?: string | { $in: string[] };
}

interface ILogQueryParams extends ICommonParams {
  start?: string;
  end?: string;
  userId?: string;
  page?: number;
  perPage?: number;
  objectId?: string | { $in: string[] };
  $or: any[];
  desc?: string;
}

interface IFilter extends ICommonParams {
  createdAt?: any;
  createdBy?: string;
  description?: object;
}

const logQueries = {
  /**
   * Fetches logs from logs api server
   */
  async logs(_root, params: ILogQueryParams) {
    const { start, end, userId, action, page, perPage, type, desc } = params;
      const filter: IFilter = {};

      // filter by date
      if (start && end) {
        filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
      } else if (start) {
        filter.createdAt = { $gte: new Date(start) };
      } else if (end) {
        filter.createdAt = { $lte: new Date(end) };
      }

      // filter by user
      if (userId) {
        filter.createdBy = userId;
      }

      // filter by actions
      if (action) {
        filter.action = action;
      }

      // filter by module
      if (type) {
        filter.type = type;
      }

      // filter by description text
      if (desc) {
        filter.description = { $regex: desc, $options: '$i' };
      }

      const _page = Number(page || '1');
      const _limit = Number(perPage || '20');

      const logs = await Logs.find(filter)
        .sort({ createdAt: -1 })
        .limit(_limit)
        .skip((_page - 1) * _limit);

      const logsCount = await Logs.countDocuments(filter);

      return { logs, totalCount: logsCount };
  },
  async getDbSchemaLabels(_root, params: { type: string }) {
    let serviceName = '';

    const service = MAPPED_MODULE_NAMES.find(item => item.MODULE_NAMES.includes(params.type));

    if (service) {
      serviceName = service.SERVICE_NAME;
    }

    const response = await getDbSchemaLabels(serviceName, params.type);

    return response;
  },
};

checkPermission(logQueries, "logs", "viewLogs");

export default logQueries;
