import { debug } from "./configs";
import ActivityLogs, { IActivityLogDocument } from "./models/ActivityLogs";
import Logs from "./models/Logs";
import Visitors from "./models/Visitors";
import { receivePutLogCommand, sendToApi } from "./utils";
import { serviceDiscovery } from './configs';

let client;

const checkAvailability = async (activityLog: IActivityLogDocument) => {
  const [serviceName] = activityLog.contentType.split(':');
  const available = await serviceDiscovery.isAvailable(serviceName);

  if (!available) {
    return null;
  }

  return serviceName;
};

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue('putLog', async data => {
    try {
      await receivePutLogCommand(data);
    } catch (e) {
      throw new Error(`Error occurred when receiving putLog message: ${e}`);
    }
  });

  consumeQueue('visitor:createOrUpdate', async data => {
    await Visitors.createOrUpdateVisitorLog(data);
  });

  consumeQueue('visitor:convertRequest', async ({ visitorId }) => {
    const visitor = await Visitors.getVisitorLog(visitorId);

    sendToApi('visitor:convertResponse', visitor);
  });

  consumeQueue(
    'visitor:updateEntry',
    async ({ visitorId, location: browserInfo }) => {
      await Visitors.updateVisitorLog({ visitorId, location: browserInfo });
    }
  );

  consumeQueue('visitor:removeEntry', async ({ visitorId }) => {
    await Visitors.removeVisitorLog(visitorId);
  });

  consumeQueue('putActivityLog', async parsedObject => {
    debug.info(parsedObject);

    const { data, action } = parsedObject;

    switch (action) {
      case 'add':
        return ActivityLogs.addActivityLog(data);
      case 'createBoardItem':
        return ActivityLogs.createBoardItemLog(data);
      case 'createBoardItemMovementLog': {
        const { item, contentType, userId, activityLogContent } = data;

        return ActivityLogs.createBoardItemMovementLog(
          item,
          contentType,
          userId,
          activityLogContent
        );
      }
      case 'createArchiveLog':
        return ActivityLogs.createArchiveLog(data);
      case 'createAssigneLog':
        return ActivityLogs.createAssigneLog(data);
      case 'createTagLog':
        return ActivityLogs.createTagLog(data);
      case 'createBoardItems':
        return ActivityLogs.createBoardItemsLog(data);
      case 'removeActivityLogs': {
        const { type, itemIds } = data;

        return ActivityLogs.removeActivityLogs(type, itemIds);
      }
      case 'removeActivityLog': {
        const { contentTypeId } = data;

        return ActivityLogs.removeActivityLog(contentTypeId);
      }
      case 'createChecklistLog': {
        return ActivityLogs.createChecklistLog(data);
      }
      case 'createCocLog': {
        return ActivityLogs.createCocLog(data);
      }
      case 'createCocLogs': {
        return ActivityLogs.createCocLogs(data);
      }
      case 'createSegmentLog': {
        const { segment, contentIds, type } = data;

        return ActivityLogs.createSegmentLog(segment, contentIds, type);
      }
      case 'sendEmailCampaign':
      case 'sendSmsCampaign':
        const { contentId, createdBy, content } = data;

        return ActivityLogs.addActivityLog({
          action: 'send',
          contentType: data.contentType,
          contentId,
          createdBy,
          content
        });
      default:
        break;
    }
  });

  consumeQueue('log:delete:old', async ({ months = 1 }) => {
    const now = new Date();
    await Logs.deleteMany({
      createdAt: {
        $lte: new Date(
          now.getFullYear(),
          now.getMonth() - months,
          now.getDate()
        )
      }
    });
  });
};

export const getDbSchemaLabels = async (serviceName: string, type: string) => {
  const available = await serviceDiscovery.isAvailable(serviceName);

  if (!available) {
    return [];
  }

  return client.sendRPCMessage(`${serviceName}:rpc_queue:logs:getSchemaLabels`, { type })
};

export const getActivityContentItem = async (activityLog: IActivityLogDocument) => {
  const serviceName = await checkAvailability(activityLog);

  return serviceName && client.sendRPCMessage(`${serviceName}:rpc_queue:getActivityContent`, { activityLog })
};

export const getContentTypeDetail = async (activityLog: IActivityLogDocument) => {
  await checkAvailability(activityLog);

  return client.sendRPCMessage('cards:rpc_queue:getContentTypeDetail', { activityLog });
};

export const collectServiceItems = async (contentType, data) => {
  const [serviceName] = contentType.split(':');
  const available = await serviceDiscovery.isAvailable(serviceName);

  if (!available) {
    return [];
  }

  return client.sendRPCMessage(`${serviceName}:rpc_queue:activityLog:collectItems`, data);
};

export const getCardContentIds = async (data) => {
  return client.sendRPCMessage('cards:rpc_queue:getCardContentIds', data);
};

export const getInternalNotes = async (data) => {
  return client.sendRPCMessage('internalnotes:rpc_queue:getInternalNotes', data);
};

export default function() {
  return client;
}
