import {
  putCreateLog as putCreateLogC,
  putDeleteLog as putDeleteLogC,
  putUpdateLog as putUpdateLogC
} from 'erxes-api-utils';
import * as _ from 'underscore';

import { IProductDocument } from '../db/models/definitions/products';
import { IUserDocument } from '../db/models/definitions/users';
import {
  ProductCategories,
  Products,
  Segments,
  Users,
  UsersGroups
} from '../db/models/index';
import { debugError } from '../debuggers';
import messageBroker from '../messageBroker';
import { MODULE_NAMES, RABBITMQ_QUEUES } from './constants';

import {
  getSubServiceDomain,
  registerOnboardHistory,
  sendRequest,
  sendToWebhook
} from './utils';

export type LogDesc = {
  [key: string]: any;
} & { name: any };

interface ILogNameParams {
  idFields: string[];
  foreignKey: string;
  prevList?: LogDesc[];
}

interface ILogParams extends ILogNameParams {
  collection: any;
  nameFields: string[];
}

/**
 * @param object - Previous state of the object
 * @param newData - Requested update data
 * @param updatedDocument - State after any updates to the object
 */
export interface ILogDataParams {
  type: string;
  description?: string;
  object: any;
  newData?: object;
  extraDesc?: object[];
  updatedDocument?: any;
}

export interface ILogQueryParams {
  start?: string;
  end?: string;
  userId?: string;
  action?: string | { $in: string[] };
  page?: number;
  perPage?: number;
  type?: string | { $in: string[] };
  objectId?: string | { $in: string[] };
  $or: any[];
}

export interface IActivityLogQueryParams {
  contentId?: any;
  contentType?: string;
  action?: any;
}

interface IDescriptions {
  description?: string;
  extraDesc?: LogDesc[];
}

interface IDescriptionParams {
  action: string;
  type: string;
  obj: any;
  updatedDocument?: any;
}

const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export const ACTIVITY_LOG_ACTIONS = {
  ADD: 'add',
  CREATE_ARCHIVE_LOG: 'createArchiveLog',
  CREATE_ASSIGNE_LOG: 'createAssigneLog',
  CREATE_COC_LOG: 'createCocLog',
  CREATE_COC_LOGS: 'createCocLogs',
  CREATE_SEGMENT_LOG: 'createSegmentLog',
  CREATE_TAG_LOG: 'createTagLog',
  REMOVE_ACTIVITY_LOG: 'removeActivityLog',
  REMOVE_ACTIVITY_LOGS: 'removeActivityLogs'
};

// used in internalNotes mutations
const findContentItemName = async (
  contentType: string,
  contentTypeId: string
): Promise<string> => {
  let name: string = '';

  if (contentType === MODULE_NAMES.USER) {
    const user = await Users.getUser(contentTypeId);

    if (user) {
      name = user.username || user.email || '';
    }
  }
  if (contentType === MODULE_NAMES.PRODUCT) {
    const product = await Products.getProduct({ _id: contentTypeId });

    if (product) {
      name = product.name;
    }
  }

  return name;
};

const gatherUsernames = async (params: ILogNameParams): Promise<LogDesc[]> => {
  const { idFields, foreignKey, prevList } = params;

  return gatherNames({
    collection: Users,
    idFields,
    foreignKey,
    prevList,
    nameFields: ['email', 'username']
  });
};

/**
 * Finds name field from given collection
 * @param params.collection Collection to find
 * @param params.idFields Id fields saved in collection
 * @param params.foreignKey Name of id fields
 * @param params.prevList Array to save found id with name
 * @param params.nameFields List of values to be mapped to id field
 */
const gatherNames = async (params: ILogParams): Promise<LogDesc[]> => {
  const {
    collection,
    idFields,
    foreignKey,
    prevList,
    nameFields = []
  } = params;
  let options: LogDesc[] = [];

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  const uniqueIds = _.compact(_.uniq(idFields));

  for (const id of uniqueIds) {
    const item = await collection.findOne({ _id: id });
    let name: string = `item with id "${id}" has been deleted`;

    if (item) {
      for (const n of nameFields) {
        if (item[n]) {
          name = item[n];
        }
      }
    }

    options.push({ [foreignKey]: id, name });
  }

  return options;
};

const gatherProductFieldNames = async (
  doc: IProductDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.categoryId) {
    options = await gatherNames({
      collection: ProductCategories,
      idFields: [doc.categoryId],
      foreignKey: 'categoryId',
      prevList: options,
      nameFields: ['name']
    });
  }

  return options;
};

const gatherUserFieldNames = async (
  doc: IUserDocument,
  prevList?: LogDesc[]
): Promise<LogDesc[]> => {
  let options: LogDesc[] = [];

  if (prevList) {
    options = prevList;
  }

  // show only user group names of users for now
  options = await gatherNames({
    collection: UsersGroups,
    idFields: doc.groupIds || [],
    foreignKey: 'groupIds',
    nameFields: ['name'],
    prevList: options
  });

  return options;
};

const gatherDescriptions = async (
  params: IDescriptionParams
): Promise<IDescriptions> => {
  const { action, type, obj, updatedDocument } = params;

  let extraDesc: LogDesc[] = [];
  let description: string = '';

  switch (type) {
    case MODULE_NAMES.BRAND:
    case MODULE_NAMES.BOARD_DEAL:
    case MODULE_NAMES.BOARD_GH:
    case MODULE_NAMES.BOARD_TASK:
    case MODULE_NAMES.BOARD_TICKET:
      if (obj.userId) {
        extraDesc = await gatherUsernames({
          idFields: [obj.userId],
          foreignKey: 'userId'
        });
      }

      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.EMAIL_TEMPLATE:
      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.IMPORT_HISTORY:
      description = `${obj._id}-${obj.date} has been removed`;

      extraDesc = await gatherUsernames({
        idFields: [obj.userId],
        foreignKey: 'userId',
        prevList: extraDesc
      });

      const param = {
        idFields: obj.ids,
        foreignKey: 'ids',
        prevList: extraDesc
      };

      switch (obj.contentType) {
        case MODULE_NAMES.PRODUCT:
          extraDesc = await gatherNames({
            ...param,
            collection: Products,
            nameFields: ['name']
          });
          break;
        default:
          break;
      }

      break;
    case MODULE_NAMES.INTERNAL_NOTE:
      description = `Note of type ${obj.contentType} has been ${action}d`;

      extraDesc = [
        {
          contentTypeId: obj.contentTypeId,
          name: await findContentItemName(obj.contentType, obj.contentTypeId)
        }
      ];

      extraDesc = await gatherUsernames({
        idFields: [obj.createdUserId],
        foreignKey: 'createdUserId',
        prevList: extraDesc
      });

      break;
    case MODULE_NAMES.PERMISSION:
      description = `Permission of module "${obj.module}", action "${obj.action}" assigned to `;

      if (obj.groupId) {
        const group = await UsersGroups.getGroup(obj.groupId);

        description = `${description} user group "${group.name}" `;

        extraDesc.push({ groupId: obj.groupId, name: group.name });
      }

      if (obj.userId) {
        const permUser = await Users.getUser(obj.userId);

        description = `${description} user "${permUser.email}" has been ${action}d`;

        extraDesc.push({
          userId: obj.userId,
          name: permUser.username || permUser.email
        });
      }

      break;
    case MODULE_NAMES.PRODUCT:
      description = `${obj.name} has been ${action}d`;

      extraDesc = await gatherProductFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherProductFieldNames(updatedDocument, extraDesc);
      }

      break;
    case MODULE_NAMES.PRODUCT_CATEGORY:
      description = `"${obj.name}" has been ${action}d`;

      const parentIds: string[] = [];

      if (obj.parentId) {
        parentIds.push(obj.parentId);
      }

      if (updatedDocument && updatedDocument.parentId !== obj.parentId) {
        parentIds.push(updatedDocument.parentId);
      }

      if (parentIds.length > 0) {
        extraDesc = await gatherNames({
          collection: ProductCategories,
          idFields: parentIds,
          foreignKey: 'parentId',
          nameFields: ['name']
        });
      }

      break;
    case MODULE_NAMES.SEGMENT:
      const parents: string[] = [];

      if (obj.subOf) {
        parents.push(obj.subOf);
      }

      if (
        updatedDocument &&
        updatedDocument.subOf &&
        updatedDocument.subOf !== obj.subOf
      ) {
        parents.push(updatedDocument.subOf);
      }

      if (parents.length > 0) {
        extraDesc = await gatherNames({
          collection: Segments,
          idFields: parents,
          foreignKey: 'subOf',
          nameFields: ['name']
        });
      }

      description = `"${obj.name}" has been ${action}d`;

      break;
    case MODULE_NAMES.USER:
      description = `"${obj.username || obj.email}" has been ${action}d`;

      extraDesc = await gatherUserFieldNames(obj);

      if (updatedDocument) {
        extraDesc = await gatherUserFieldNames(updatedDocument, extraDesc);
      }

      break;

    default:
      break;
  }

  return { extraDesc, description };
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putCreateLog = async (
  params: ILogDataParams,
  user: IUserDocument
) => {
  await registerOnboardHistory({ type: `${params.type}Create`, user });

  await sendToWebhook(LOG_ACTIONS.CREATE, params.type, params);

  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.object]
  });

  return putCreateLogC(messageBroker, gatherDescriptions, params, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putUpdateLog = async (
  params: ILogDataParams,
  user: IUserDocument
) => {
  await sendToWebhook(LOG_ACTIONS.UPDATE, params.type, params);

  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.updatedDocument]
  });

  return putUpdateLogC(messageBroker, gatherDescriptions, params, user);
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = async (
  params: ILogDataParams,
  user: IUserDocument
) => {
  await sendToWebhook(LOG_ACTIONS.DELETE, params.type, params);

  messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
    type: `${params.type}`,
    targets: [params.object]
  });

  return putDeleteLogC(messageBroker, gatherDescriptions, params, user);
};

/**
 * Sends a request to logs api
 * @param {Object} param0 Request
 */
export const fetchLogs = async (
  params: ILogQueryParams | IActivityLogQueryParams,
  type = 'logs'
) => {
  const LOGS_DOMAIN = getSubServiceDomain({ name: 'LOGS_API_DOMAIN' });

  try {
    const response = await sendRequest({
      url: `${LOGS_DOMAIN}/${type}`,
      method: 'get',
      body: { params: JSON.stringify(params) }
    });
    return response;
  } catch (e) {
    debugError(
      `Failed to connect to logs api. Check whether LOGS_API_DOMAIN env is missing or logs api is not running: ${e.message}`
    );
  }
};

export const sendToLog = (channel: string, data) =>
  messageBroker().sendMessage(channel, data);

interface IActivityLogParams {
  action: string;
  data: any;
}

export const putActivityLog = async (params: IActivityLogParams) => {
  const { data } = params;

  try {
    if (data.target) {
      messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
        type: `${data.contentType}`,
        targets: [data.target]
      });
    }

    return messageBroker().sendMessage('putActivityLog', params);
  } catch (e) {
    return e.message;
  }
};
