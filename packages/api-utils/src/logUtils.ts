import * as _ from 'underscore';
import redis from './redis';
import { IUserDocument } from './types';

export interface ILogDataParams {
  type: string;
  description?: string;
  object: any;
  newData?: object;
  extraDesc?: object[];
  updatedDocument?: any;
  extraParams?: any;
}

interface ILogNameParams {
  foreignKey: string;
  prevList?: LogDesc[];
  items: any[];
}

export interface IDescriptions {
  description?: string;
  extraDesc?: LogDesc[];
}

interface ILogParams extends ILogNameParams {
  nameFields: string[];
}

interface INameLabel {
  name: string;
  label: string;
}

interface ISchemaMap {
  name: string;
  schemas: any[];
}

/**
 * Finds name field from given collection
 * @param params.foreignKey Name of id fields
 * @param params.prevList Array to save found id with name
 * @param params.nameFields List of values to be mapped to id field
 * @param params.items Mongodb document list
 */
export const gatherNames = async (params: ILogParams): Promise<LogDesc[]> => {
  const { foreignKey, prevList, nameFields = [], items = [] } = params;

  let options: LogDesc[] = [];

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  for (const item of items) {
    if (item && item._id) {
      let name: string = '';

      for (const n of nameFields) {
        // first level field
        if (item[n]) {
          name = item[n];
        }

        // TODO: properly fill nested object fields
      }

      options.push({ [foreignKey]: item._id, name });
    }
  }

  return options;
};

export const gatherUsernames = async (
  params: ILogNameParams
): Promise<LogDesc[]> => {
  const { foreignKey, prevList, items = [] } = params;

  return gatherNames({
    foreignKey,
    prevList,
    nameFields: ['email', 'username'],
    items
  });
};

interface IFinalLogParams extends ILogDataParams {
  action: string;
}

export const LOG_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

export type LogDesc = {
  [key: string]: any;
} & { name: any };

export const putCreateLog = async (
  subdomain: string,
  messageBroker,
  params: ILogDataParams,
  user: IUserDocument
) => {
  const isAutomationsAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'automations'
  );

  if (isAutomationsAvailable) {
    messageBroker.sendMessage('automations:trigger', {
      data: {
        type: `${params.type}`,
        targets: [params.object]
      }
    });
  }

  const isWebhooksAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'webhooks'
  );

  if (isWebhooksAvailable) {
    messageBroker.sendMessage('webhooks:send', {
      data: {
        action: LOG_ACTIONS.CREATE,
        type: params.type,
        params
      }
    });
  }

  return putLog(
    subdomain,
    messageBroker,
    { ...params, action: LOG_ACTIONS.CREATE },
    user
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putUpdateLog = async (
  subdomain: string,
  messageBroker,
  params: ILogDataParams,
  user: IUserDocument
) => {
  const isAutomationsAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'automations'
  );

  if (isAutomationsAvailable) {
    messageBroker.sendMessage('automations:trigger', {
      data: {
        type: `${params.type}`,
        targets: [params.updatedDocument]
      }
    });
  }

  const isWebhooksAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'webhooks'
  );

  if (isWebhooksAvailable) {
    messageBroker.sendMessage('webhooks:send', {
      data: {
        action: LOG_ACTIONS.UPDATE,
        type: params.type,
        params
      }
    });
  }

  return putLog(
    subdomain,
    messageBroker,
    { ...params, action: LOG_ACTIONS.UPDATE },
    user
  );
};

/**
 * Prepares a create log request to log server
 * @param params Log document params
 * @param user User information from mutation context
 */
export const putDeleteLog = async (
  subdomain: string,
  messageBroker,
  params: ILogDataParams,
  user: IUserDocument
) => {
  const isWebhooksAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'webhooks'
  );

  if (isWebhooksAvailable) {
    messageBroker.sendMessage('webhooks:send', {
      data: {
        action: LOG_ACTIONS.DELETE,
        type: params.type,
        params
      }
    });
  }

  return putLog(
    subdomain,
    messageBroker,
    { ...params, action: LOG_ACTIONS.DELETE },
    user
  );
};

const putLog = async (
  subdomain: string,
  messageBroker,
  params: IFinalLogParams,
  user: IUserDocument
) => {
  const value = await redis.get('afterMutations');
  const afterMutations = JSON.parse(value || '{}');

  if (
    afterMutations[params.type] &&
    afterMutations[params.type][params.action] &&
    afterMutations[params.type][params.action].length
  ) {
    for (const service of afterMutations[params.type][params.action]) {
      await messageBroker.sendMessage(`${service}:afterMutation`, {
        subdomain,
        data: {
          ...params,
          object: params.object,
          newData: params.newData,
          extraDesc: params.extraDesc,
          user
        }
      });
    }
  }

  const isLoggerAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'logs'
  );

  if (!isLoggerAvailable) {
    return;
  }

  return messageBroker.sendMessage('putLog', {
    subdomain,
    data: {
      ...params,
      createdBy: user._id,
      unicode: user.username || user.email || user._id,
      object: JSON.stringify(params.object),
      newData: JSON.stringify(params.newData),
      extraDesc: JSON.stringify(params.extraDesc)
    }
  });
};

export interface IActivityLogParams {
  messageBroker;
  action: string;
  data: any;
}

export const putActivityLog = async (
  subdomain: string,
  params: IActivityLogParams
) => {
  const { messageBroker, data } = params;
  const isAutomationsAvailable = await messageBroker.sendRPCMessage(
    'gateway:isServiceAvailable',
    'automations'
  );

  try {
    if (isAutomationsAvailable && data.target) {
      messageBroker.sendMessage('automations', {
        data: {
          type: `${data.contentType}`,
          targets: [data.target]
        }
      });
    }

    return messageBroker.sendMessage('putActivityLog', {
      data: params,
      subdomain
    });
  } catch (e) {
    return e.message;
  }
};

/**
 * Creates field name-label mapping list from given object
 */
const buildLabelList = (obj = {}): INameLabel[] => {
  const list: INameLabel[] = [];
  const fieldNames: string[] = Object.getOwnPropertyNames(obj);

  for (const name of fieldNames) {
    const field: any = obj[name];
    const label: string = field && field.label ? field.label : '';

    list.push({ name, label });
  }

  return list;
};

export const getSchemaLabels = (type: string, schemaMappings: ISchemaMap[]) => {
  let fieldNames: INameLabel[] = [];

  const found: ISchemaMap | undefined = schemaMappings.find(
    m => m.name === type
  );

  if (found) {
    const schemas: any = found.schemas || [];

    for (const schema of schemas) {
      // schema comes as either mongoose schema or plain object
      const names: string[] = Object.getOwnPropertyNames(schema.obj || schema);

      for (const name of names) {
        const field: any = schema.obj ? schema.obj[name] : schema[name];

        if (field && field.label) {
          fieldNames.push({ name, label: field.label });
        }

        // nested object field names
        if (typeof field === 'object' && field.type && field.type.obj) {
          fieldNames = fieldNames.concat(buildLabelList(field.type.obj));
        }
      }
    } // end schema for loop
  } // end schema name mapping

  return fieldNames;
};

export const logConsumers = (params: {
  name;
  consumeRPCQueue?;
  getActivityContent?;
  getContentTypeDetail?;
  collectItems?;
  getContentIds?;
  getSchemalabels?;
}) => {
  const {
    name,
    consumeRPCQueue,
    getActivityContent,
    getContentTypeDetail,
    collectItems,
    getContentIds,
    getSchemalabels
  } = params;

  if (getActivityContent) {
    consumeRPCQueue(`${name}:logs.getActivityContent`, async args => ({
      status: 'success',
      data: await getActivityContent(args)
    }));
  }

  if (getContentTypeDetail) {
    consumeRPCQueue(`${name}:logs.getContentTypeDetail`, async args => ({
      status: 'success',
      data: await getContentTypeDetail(args)
    }));
  }

  if (collectItems) {
    consumeRPCQueue(`${name}:logs.collectItems`, async args => ({
      status: 'success',
      data: await collectItems(args)
    }));
  }

  if (getContentIds) {
    consumeRPCQueue(`${name}:logs.getContentIds`, async args => ({
      status: 'success',
      data: await getContentIds(args)
    }));
  }

  if (getSchemalabels) {
    consumeRPCQueue(`${name}:logs.getSchemaLabels`, args => ({
      status: 'success',
      data: getSchemalabels(args)
    }));
  }
};
