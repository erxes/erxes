import { IUserDocument } from 'erxes-api-shared/core-types';
import { isEnabled } from 'erxes-api-shared/utils';

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

export type LogDesc = {
  [key: string]: any;
} & { name: any };

interface ILogParams extends ILogNameParams {
  nameFields: string[];
}

export const gatherNames = async (params: ILogParams): Promise<LogDesc[]> => {
  const { foreignKey, prevList, nameFields = [], items = [] } = params;

  let options: LogDesc[] = [];

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  if (!items.length) {
    return options;
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
  params: ILogNameParams,
): Promise<LogDesc[]> => {
  const { foreignKey, prevList, items = [] } = params;

  return gatherNames({
    foreignKey,
    prevList,
    nameFields: ['email', 'username'],
    items,
  });
};

export const putCreateLog = async (
  subdomain: string,
  params: ILogDataParams,
  user: IUserDocument,
) => {
  const isAutomationsAvailable = await isEnabled('automations');

  if (isAutomationsAvailable) {
    sendMessage('automations:trigger', {
      subdomain,
      data: {
        type: `${params.type}`,
        targets: [params.object],
      },
    });
  }

  const isWebhooksAvailable = await isEnabled('webhooks');

  if (isWebhooksAvailable) {
    sendMessage('webhooks:send', {
      subdomain,
      data: {
        action: LOG_ACTIONS.CREATE,
        type: params.type,
        params,
      },
    });
  }

  return putLog(subdomain, { ...params, action: LOG_ACTIONS.CREATE }, user);
};
