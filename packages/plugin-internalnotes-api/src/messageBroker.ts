import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { serviceDiscovery } from './configs';
import { models } from './connectionResolver';
import { internalNoteSchema } from './models/definitions/internalNotes';

const checkService = async (serviceName: string, needsList?: boolean) => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);

  if (!enabled) {
    return needsList ? [] : null;
  }

  return;
};

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = cl;

  consumeQueue(
    'internalNotes:batchUpdate',
    async ({ contentType, oldContentTypeIds, newContentTypeId }) => {
      // Updating every internal notes of company
      await models.InternalNotes.updateMany(
        {
          contentType,
          contentTypeId: { $in: oldContentTypeIds || [] },
        },
        { contentTypeId: newContentTypeId }
      );
    }
  );

  consumeRPCQueue(
    'internalnotes:rpc_queue:activityLog:collectItems',
    async ({ contentId }) => {
      const notes = await models.InternalNotes.find({
        contentTypeId: contentId,
      }).sort({ createdAt: -1 });
      const results: any[] = [];

      for (const note of notes) {
        results.push({
          _id: note._id,
          contentType: 'note',
          contentId,
          createdAt: note.createdAt,
        });
      }

      return {
        status: 'success',
        data: results,
      };
    }
  );

  consumeRPCQueue(
    'internalnotes:rpc_queue:getInternalNotes',
    async ({ contentTypeIds, perPageForAction, page }) => {
      const filter = { contentTypeId: { $in: contentTypeIds } };

      const internalNotes = await models.InternalNotes.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(perPageForAction * (page - 1))
        .limit(perPageForAction);

      return {
        internalNotes,
        totalCount: await models.InternalNotes.countDocuments(filter),
      };
    }
  );

  consumeRPCQueue(
    'internalnotes:rpc_queue:logs:getSchemaLabels',
    async ({ type }) => ({
      status: 'success',
      data: getSchemaLabels(type, [
        { name: 'internalNote', schemas: [internalNoteSchema] },
      ]),
    })
  );

  consumeQueue(
    'internalnotes:InternalNotes.removeInternalNotes',
    ({ contentType, contentTypeIds }) => {
      models.InternalNotes.removeInternalNotes(contentType, contentTypeIds);
    }
  );
};

export const sendNotificationMessage = async (
  action,
  data,
  isRPC?: boolean,
  defaultValue?
): Promise<any> => {
  if (isRPC) {
    if (!(await serviceDiscovery.isEnabled('notifications'))) {
      return defaultValue;
    }

    return client.sendRPCMessage(`notifications:rpc_queue:${action}`, data);
  }

  return client.sendMessage(`notifications:${action}`, data);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const findItem = async (data) => {
  const [serviceName] = data.contentType.split(':');

  await checkService(serviceName, false);

  return client.sendRPCMessage(`${serviceName}:rpc_queue:findItem`, data);
};

export const getContentIds = async (data) => {
  const [serviceName] = data.contentType.split(':');

  await checkService(serviceName, true);

  return client.sendRPCMessage(`${serviceName}:rpc_queue:getContentIds`, data);
};

export default function() {
  return client;
}
