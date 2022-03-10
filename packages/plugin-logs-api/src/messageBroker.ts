import { debug } from "./configs";
import ActivityLogs, { IActivityLogDocument } from "./models/ActivityLogs";
import Logs from "./models/Logs";
import Visitors from "./models/Visitors";
import { receivePutLogCommand, sendToApi } from "./utils";
import { serviceDiscovery } from './configs';
import { getService } from './inmemoryStorage';

let client;

const hasMetaLogs = async (serviceName: string) => {
  const service = await getService(serviceName, true);

  if (!service) {
    return false;
  }

  const { meta = {} } = service;

  if (!(meta.logs && meta.logs.providesActivityLog === true)) {
    return false;
  }

  return true;
}

const isServiceEnabled = async (serviceName: string): Promise<boolean> => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);
  const hasMeta = await hasMetaLogs(serviceName);

  return enabled && hasMeta;
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
  const enabled = await serviceDiscovery.isEnabled(serviceName);

  return enabled ? client.sendRPCMessage(`${serviceName}:rpc_queue:logs:getSchemaLabels`, { type }) : [];
};

export const getActivityContentItem = async (activityLog: IActivityLogDocument) => {
  const [serviceName] = activityLog.contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled ? client.sendRPCMessage(`${serviceName}:logs:getActivityContent`, { activityLog }) : null;
};

export const getContentTypeDetail = async (activityLog: IActivityLogDocument) => {
  const [serviceName] = activityLog.contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled ? client.sendRPCMessage(`${serviceName}:logs:getContentTypeDetail`, { activityLog }) : null;
};

export const collectServiceItems = async (contentType: string, data) => {
  const [serviceName] = contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled ? client.sendRPCMessage(`${serviceName}:logs:collectItems`, data) : [];
};

export const getContentIds = async (data) => {
  const [serviceName] = data.contentType.split(':');
  
  const enabled = await isServiceEnabled(serviceName);

  return enabled ? client.sendRPCMessage(`${serviceName}:logs:getContentIds`, data) : [];
};

export default function() {
  return client;
}
