import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { debugBase } from './debuggers';
import ActivityLogs from './models/ActivityLogs';
import Visitors from './models/Visitors';
import { receivePutLogCommand } from './utils';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('putLog', async data => {
    await receivePutLogCommand(data);
  });

  consumeQueue('visitorLog', async parsedObject => {
    const { data, action } = parsedObject;

    switch (action) {
      case 'update':
        return Visitors.updateVisitorLog(data);
      case 'createOrUpdate':
        return Visitors.createOrUpdateVisitorLog(data);
      case 'remove':
        return Visitors.removeVisitorLog(data.visitorId);
      default:
        break;
    }
  });

  consumeQueue('putActivityLog', async parsedObject => {
    debugBase(parsedObject);

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
        const { segment, customerIds, type } = data;

        return ActivityLogs.createSegmentLog(segment, customerIds, type);
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

  consumeRPCQueue('rpc_queue:visitorLog', async parsedObject => {
    const { action, data } = parsedObject;

    let response = null;

    try {
      if (action === 'get') {
        response = { data: await Visitors.getVisitorLog(data.visitorId) };
      }

      response.status = 'success';
    } catch (e) {
      response = {
        status: 'error',
        errorMessage: e.message
      };
    }

    return response;
  });
};

export default function() {
  return client;
}
