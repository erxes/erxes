import { Stages, Tasks, Tickets } from '@erxes/api-utils/src/apiCollections';
import { serviceDiscovery } from './configs';
import { generateFields } from './fieldUtils';
import { prepareImportDocs } from './importUtils';
import { Checklists } from './models';
import { generateConditionStageIds } from './utils';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue('cards:rpc_queue:createTickets', async (args) => ({
    status: 'success',
    data: await Tickets.create(args),
  }));

  consumeRPCQueue('cards:rpc_queue:createTasks', async (args) => ({
    status: 'success',
    data: await Tasks.create(args),
  }));

  consumeRPCQueue('cards:rpc_queue:findTickets', async (args) => ({
    status: 'success',
    data: await Tickets.find(args),
  }));

  consumeRPCQueue('cards:rpc_queue:findOneTickets', async (args) => ({
    status: 'success',
    data: await Tickets.findOne(args),
  }));

  consumeRPCQueue('cards:rpc_queue:findStages', async (args) => ({
    status: 'success',
    data: await Stages.find(args),
  }));

  consumeRPCQueue('cards:rpc_queue:findTasks', async (args) => ({
    status: 'success',
    data: await Tasks.find(args),
  }));

  consumeRPCQueue('cards:rpc_queue:findOneTasks', async (args) => ({
    status: 'success',
    data: await Tasks.findOne(args),
  }));

  consumeQueue('checklists:removeChecklists', async ({ type, itemIds }) => ({
    status: 'success',
    data: await Checklists.removeChecklists(type, itemIds),
  }));

  consumeRPCQueue('cards:rpc_queue:getFields', async (args) => ({
    status: 'success',
    data: await generateFields(args),
  }));

  consumeRPCQueue('cards:rpc_queue:getFields', async (args) => ({
    status: 'success',
    data: await generateFields(args),
  }));

  consumeRPCQueue('cards:rpc_queue:prepareImportDocs', async (args) => ({
    status: 'success',
    data: await prepareImportDocs(args),
  }));

  // listen for rpc queue =========
  consumeRPCQueue(
    'cards:segments:propertyConditionExtender',
    async ({ condition }) => {
      let positive;

      const stageIds = await generateConditionStageIds({
        boardId: condition.boardId,
        pipelineId: condition.pipelineId,
      });

      if (stageIds.length > 0) {
        positive = {
          terms: {
            stageId: stageIds,
          },
        };
      }

      return { data: { positive }, status: 'success' };
    }
  );

  consumeRPCQueue('cards:segments:associationTypes', async ({ mainType }) => {
    let types: string[] = [];

    if (mainType === 'deal') {
      types = ['customer', 'company', 'ticket', 'task'];
    }

    if (mainType === 'task') {
      types = ['customer', 'company', 'ticket', 'deal'];
    }

    if (mainType === 'ticket') {
      types = ['customer', 'company', 'deal', 'task'];
    }

    return { data: { types }, status: 'success' };
  });

  consumeRPCQueue('cards:segments:esTypesMap', async () => {
    return { data: { typesMap: {} }, status: 'success' };
  });

  consumeRPCQueue(
    'cards:segments:initialSelector',
    async ({ segment, options }) => {
      let positive;

      const stageIds = await generateConditionStageIds({
        boardId: segment.boardId,
        pipelineId: segment.pipelineId,
        options,
      });

      if (stageIds.length > 0) {
        positive = { terms: { stageId: stageIds } };
      }

      return { data: { positive }, status: 'success' };
    }
  );
};

export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendContactMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`contacts:${action}`, data);
};

export const sendContactRPCMessage = async (action, data): Promise<any> => {
  if (!await serviceDiscovery.isAvailable('contacts')) {
    return []
  }

  return client.sendRPCMessage(`contacts:rpc_queue:${action}`, data);
};

export const sendFormRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`forms:rpc_queue:${action}`, data);
};

export const sendFormMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`forms:${action}`, data);
};

export const sendChecklistMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`checklists:${action}`, data);
};

export const sendChecklistRPCMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`checklists:rpc_queue:${action}`, data);
};

export const sendInternalNoteMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`internalNotes:${action}`, data);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`conformities:${action}`, data);
};

export const sendFieldsGroupMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`fieldsGroups:${action}`, data);
};

export const sendEngageRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`engages:rpc_queue:${action}`, data);
};

export const sendFieldRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`fields:rpc_queue:${action}`, data);
};

export const findProducts = async (action, data): Promise<any> => {
  if (!await serviceDiscovery.isAvailable('products')) {
    return [];
  }

  return client.sendRPCMessage(`products:rpc_queue:${action}`, data);
};

export const updateProducts = async (selector, modifier): Promise<any> => {
  return client.sendRPCMessage(`products:rpc_queue:update`, { selector, modifier });
};

export const sendNotificationRPCMessage = async (
  action,
  data
): Promise<any> => {
  return client.sendRPCMessage(`notifications:rpc_queue:${action}`, data);
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const fetchSegment = (segment, options?) =>
  sendRPCMessage('rpc_queue:fetchSegment', {
    segment,
    options,
  });

export default function() {
  return client;
}
