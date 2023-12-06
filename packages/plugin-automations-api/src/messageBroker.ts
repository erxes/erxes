import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import { setTimeout } from 'timers';
import { receiveTrigger } from './utils';
import { serviceDiscovery } from './configs';
import { playWait } from './actions';
import { generateModels } from './connectionResolver';
import { setActionWait, doWaitingResponseAction } from './actions/wait';
import { EXECUTION_STATUS } from './models/definitions/executions';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = cl;

  consumeQueue('automations:trigger', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { type, actionType, targets } = data;

    if (actionType && actionType === 'waiting') {
      await playWait(models, subdomain, data);
      return;
    }

    console.log(
      (await models.Executions.find({
        triggerType: type,
        status: EXECUTION_STATUS.WAITING,
        $and: [{ objToCheck: { $exists: true } }, { objToCheck: { $ne: null } }]
      }).count()) > 0
    );

    if (
      !actionType &&
      (await models.Executions.find({
        triggerType: type,
        status: EXECUTION_STATUS.WAITING,
        $and: [{ objToCheck: { $exists: true } }, { objToCheck: { $ne: null } }]
      }).count()) > 0
    ) {
      console.log({
        ...data,
        actionType: 'optionalConnect'
      });

      await doWaitingResponseAction(models, subdomain, data);
      return;
    }

    setTimeout(async () => {
      await receiveTrigger({ models, subdomain, type, targets });
    }, 10000);
  });

  consumeQueue('automations:find.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query = {} } = data || {};

    return {
      status: 'success',
      data: await models.Automations.countDocuments(query)
    };
  });

  consumeRPCQueue('automations:setActionWait', async ({ subdomain, data }) => {
    return {
      // data: await models.Accounts.find(selector).lean(),
      data: await setActionWait(subdomain, data),
      status: 'success'
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendEmailTemplateMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'emailtemplates',
    ...args
  });
};

export const sendLogsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'logs',
    ...args
  });
};

export default function() {
  return client;
}
