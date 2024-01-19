import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  ISendMessageArgsNoService,
  ISendMessageArgs,
} from '@erxes/api-utils/src/core';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import { setTimeout } from 'timers';
import { playWait } from './actions';
import {
  checkWaitingResponseAction,
  doWaitingResponseAction,
  setActionWait,
} from './actions/wait';
import { generateModels } from './connectionResolver';
import { receiveTrigger } from './utils';
import { consumeQueue } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeQueue('automations:trigger', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { type, actionType, targets } = data;

    if (actionType && actionType === 'waiting') {
      await playWait(models, subdomain, data);
      return;
    }

    if (await checkWaitingResponseAction(models, type, actionType, targets)) {
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
      data: await models.Automations.countDocuments(query),
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendCoreMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};

export const sendEmailTemplateMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'emailtemplates',
    ...args,
  });
};

export const sendLogsMessage = (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'logs',
    ...args,
  });
};
