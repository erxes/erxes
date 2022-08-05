import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { debugBase } from './debuggers';
import ActivityLogs from './models/ActivityLogs';
import Logs from './models/Logs';
import Visitors from './models/Visitors';
import { receivePutLogCommand, sendToApi } from './utils';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  const { consumeQueue } = client;

  consumeQueue('putLog', async data => {
    await receivePutLogCommand(data);
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

export default function() {
  return client;
}
