import { ILogDataParams } from '@erxes/api-utils/src/logUtils';

import {
  putCreateLog as commonPutCreateLog,
  putUpdateLog as commonPutUpdateLog,
  putDeleteLog as commonPutDeleteLog
} from '@erxes/api-utils/src/logUtils';

import { putActivityLog as commonPutActivityLog } from '@erxes/api-utils/src/logUtils';

import messageBroker from './messageBroker';
import { generateModels } from './connectionResolver';

export const putDeleteLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutDeleteLog(
    subdomain,
    messageBroker(),
    { ...logDoc, type: `automations:${logDoc.type}` },
    user
  );
};

export const putUpdateLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutUpdateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, type: `automations:${logDoc.type}` },
    user
  );
};

export const putCreateLog = async (
  subdomain: string,
  logDoc: ILogDataParams,
  user
) => {
  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, type: `automations:${logDoc.type}` },
    user
  );
};

export const putActivityLog = async (
  subdomain,
  params: { action: string; data: any }
) => {
  const { data, action } = params;

  const updatedParams = {
    ...params,
    data: { ...data, contentType: `${data.contentType}` }
  };

  return commonPutActivityLog(subdomain, {
    messageBroker: messageBroker(),
    ...updatedParams
  });
};

const sendSuccess = data => ({
  data,
  status: 'success'
});

const getResultDoc = (action, result, target) => {
  if (action === 'sendEmail') {
    const { responses } = result || {};

    return responses;
  }

  return null;
};

export default {
  collectItems: async ({ subdomain, data }) => {
    const { activityLogs, contentId } = data || {};

    const models = await generateModels(subdomain);

    const items = (activityLogs || []).filter(
      item => item.createdBy === 'automation'
    );

    if (!items.length) {
      return sendSuccess([]);
    }

    const itemsActions = [...new Set(items.map(item => item.action))];

    const excutions = await models.Executions.find({
      targetId: contentId,
      status: 'complete',
      'actions.actionType': { $in: itemsActions }
    })
      .sort({ createdAt: -1 })
      .lean();

    const excutionLogs: any[] = [];

    for (const itemAction of itemsActions) {
      for (const {
        triggerType,
        automationId,
        triggerConfig,
        actions,
        target
      } of excutions) {
        for (const action of actions || []) {
          if (action?.actionType === itemAction) {
            let excutionLog = {
              action: itemAction,
              contentType: `automations:${itemAction}`,
              contentDetail: {
                automationId,
                triggerConfig,
                triggerType,
                actionConfig: action.actionConfig,
                result: getResultDoc(itemAction, action.result, target)
              },
              createdAt: action.createdAt
            };

            excutionLogs.push(excutionLog);
          }
        }
      }
    }

    return {
      data: excutionLogs,
      status: 'success'
    };
  }
};
