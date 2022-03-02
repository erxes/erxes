import { debug } from "./configs";
import ActivityLogs, { IActivityLogDocument } from "./models/ActivityLogs";
import Logs from "./models/Logs";
import Visitors from "./models/Visitors";
import { receivePutLogCommand, sendToApi } from "./utils";
import { serviceDiscovery } from './configs';

let client;

const checkService = async (serviceName: string, needsList?: boolean) => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);

  if (!enabled) {
    return needsList ? [] : null;
  }

  return;
};

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

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
      case 'removeActivityLogs': {
        const { type, itemIds } = data;

        return ActivityLogs.removeActivityLogs(type, itemIds);
      }
      case 'removeActivityLog': {
        const { contentTypeId } = data;

        return ActivityLogs.removeActivityLog(contentTypeId);
      }
      default:
        if (action) {
          return ActivityLogs.addActivityLog(data);
        }

        break;
    }
  });

  consumeQueue('logs:activityLogs:updateMany', async ({ query, modifier }) => {
    if (query && modifier) {
      await ActivityLogs.updateMany(query, modifier);
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

  consumeRPCQueue('logs:activityLogs:findMany', async ({ query, options }) => ({
    data: await ActivityLogs.find(query, options).lean(), status: 'success'
  }));

  consumeRPCQueue('logs:activityLogs:insertMany', async ({ rows }) => ({
    data: await ActivityLogs.insertMany(rows), status: 'success'
  }));
};

export const getDbSchemaLabels = async (serviceName: string, type: string) => {
  await checkService(serviceName, true);

  return client.sendRPCMessage(`${serviceName}:rpc_queue:logs:getSchemaLabels`, { type })
};

export const getActivityContentItem = async (activityLog: IActivityLogDocument) => {
  const [serviceName] = activityLog.contentType.split(':');

  await checkService(serviceName, false);

  return serviceName && client.sendRPCMessage(`${serviceName}:rpc_queue:getActivityContent`, { activityLog })
};

export const getContentTypeDetail = async (activityLog: IActivityLogDocument) => {
  const [serviceName] = activityLog.contentType.split(':');

  await checkService(serviceName, false);

  return client.sendRPCMessage(`${serviceName}:rpc_queue:getContentTypeDetail`, { activityLog });
};

export const collectServiceItems = async (contentType: string, data) => {
  const [serviceName] = contentType.split(':');

  await checkService(serviceName, true);

  return client.sendRPCMessage(`${serviceName}:rpc_queue:activityLog:collectItems`, data);
};

export const getContentIds = async (data) => {
  const [serviceName] = data.contentType.split(':');
  
  await checkService(serviceName, true);

  return client.sendRPCMessage(`${serviceName}:rpc_queue:getContentIds`, data);
};

export default function() {
  return client;
}
