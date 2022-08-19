import { debug } from './configs';
import { IActivityLogDocument } from './models/ActivityLogs';
import { receivePutLogCommand, sendToApi } from './utils';
import { serviceDiscovery } from './configs';
import { getService } from '@erxes/api-utils/src/serviceDiscovery';
import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

let client;

const hasMetaLogs = async (serviceName: string) => {
  const service = await getService(serviceName, true);

  if (!service) {
    return false;
  }

  const meta: any = service.config?.meta || {};

  if (!(meta.logs && meta.logs.providesActivityLog === true)) {
    return false;
  }

  return true;
};

const isServiceEnabled = async (serviceName: string): Promise<boolean> => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);
  const hasMeta = await hasMetaLogs(serviceName);

  return enabled && hasMeta;
};

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('putLog', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    try {
      await receivePutLogCommand(models, data);
    } catch (e) {
      throw new Error(`Error occurred when receiving putLog message: ${e}`);
    }
  });

  consumeQueue('logs:visitor.createOrUpdate', async ({ data, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.Visitors.createOrUpdateVisitorLog(data);
  });

  consumeQueue(
    'logs:visitor.convertRequest',
    async ({ data: { visitorId }, subdomain }) => {
      const models = await generateModels(subdomain);
      const visitor = await models.Visitors.getVisitorLog(visitorId);

      await sendInboxMessage({
        subdomain,
        action: 'visitor.convertResponse',
        data: visitor
      });
    }
  );

  consumeQueue(
    'logs:visitor.updateEntry',
    async ({ data: { visitorId, location: browserInfo }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.Visitors.updateVisitorLog({
        visitorId,
        location: browserInfo
      });
    }
  );

  consumeQueue(
    'logs:visitor.removeEntry',
    async ({ data: { visitorId }, subdomain }) => {
      const models = await generateModels(subdomain);

      await models.Visitors.removeVisitorLog(visitorId);
    }
  );

  consumeQueue('putActivityLog', async args => {
    debug.info(args);

    const { data: obj, subdomain } = args;

    const models = await generateModels(subdomain);

    const { data, action } = obj;

    switch (action) {
      case 'removeActivityLogs': {
        const { type, itemIds } = data;

        return models.ActivityLogs.removeActivityLogs(type, itemIds);
      }
      case 'removeActivityLog': {
        const { contentTypeId } = data;

        return models.ActivityLogs.removeActivityLog(contentTypeId);
      }
      default:
        if (action) {
          return models.ActivityLogs.addActivityLog(data);
        }

        break;
    }
  });

  consumeQueue(
    'logs:activityLogs.updateMany',
    async ({ data: { query, modifier }, subdomain }) => {
      const models = await generateModels(subdomain);

      if (query && modifier) {
        await models.ActivityLogs.updateMany(query, modifier);
      }
    }
  );

  consumeQueue(
    'logs:delete.old',
    async ({ data: { months = 1 }, subdomain }) => {
      const models = await generateModels(subdomain);
      const now = new Date();

      await models.Logs.deleteMany({
        createdAt: {
          $lte: new Date(
            now.getFullYear(),
            now.getMonth() - months,
            now.getDate()
          )
        }
      });
    }
  );

  consumeRPCQueue(
    'logs:activityLogs.findMany',
    async ({ data: { query, options }, subdomain }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ActivityLogs.find(query, options).lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'logs.activityLogs.insertMany',
    async ({ data: { rows }, subdomain }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ActivityLogs.insertMany(rows),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'logs:emailDeliveries.create',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.EmailDeliveries.createEmailDelivery(data)
      };
    }
  );

  consumeRPCQueue(
    'logs:emailDeliveries.find',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.EmailDeliveries.find(query).lean()
      };
    }
  );
};

export const getDbSchemaLabels = async (serviceName: string, args) => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);

  return enabled
    ? client.sendRPCMessage(`${serviceName}:logs.getSchemaLabels`, args)
    : [];
};

export const getActivityContentItem = async (
  activityLog: IActivityLogDocument
) => {
  const [serviceName] = activityLog.contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled
    ? client.sendRPCMessage(`${serviceName}:logs.getActivityContent`, {
        activityLog
      })
    : null;
};

export const getContentTypeDetail = async (
  activityLog: IActivityLogDocument
) => {
  const [serviceName] = activityLog.contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled
    ? client.sendRPCMessage(`${serviceName}:logs.getContentTypeDetail`, {
        activityLog
      })
    : null;
};

export const collectServiceItems = async (contentType: string, data) => {
  const [serviceName] = contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled
    ? client.sendRPCMessage(`${serviceName}:logs.collectItems`, data)
    : [];
};

export const getContentIds = async data => {
  const [serviceName] = data.contentType.split(':');

  const enabled = await isServiceEnabled(serviceName);

  return enabled
    ? client.sendRPCMessage(`${serviceName}:logs.getContentIds`, data)
    : [];
};

export const sendCoreMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceDiscovery,
    client,
    serviceName: 'core',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceDiscovery,
    client,
    serviceName: 'inbox',
    ...args
  });
};

export const sendClientPortalMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceDiscovery,
    client,
    serviceName: 'clientportal',
    ...args
  });
};

export const fetchService = async (
  subdomain: string,
  contentType: string,
  action: string,
  data,
  defaultValue?
) => {
  const [serviceName, type] = contentType.split(':');

  return sendMessage({
    subdomain,
    serviceDiscovery,
    client,
    isRPC: true,
    serviceName,
    action: `logs.${action}`,
    data: {
      ...data,
      type
    },
    defaultValue
  });
};

export default function() {
  return client;
}
