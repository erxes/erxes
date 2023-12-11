import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';
import { IXypConfig } from './graphql/resolvers/queries';
import { sendRequest } from '@erxes/api-utils/src';

// import { Xyps } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('xyp:fetch', async ({ subdomain, data }) => {
    const xypConfigs = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: 'configs.findOne',
      data: {
        query: {
          code: 'XYP_CONFIGS'
        }
      },
      isRPC: true,
      defaultValue: null
    });

    if (!xypConfigs) {
      return {
        status: 'failed',
        message: 'XYP CONFIGS not found'
      };
    }

    const { params, wsOperationName } = data;

    const config: IXypConfig = xypConfigs && xypConfigs.value;

    const response = await sendRequest({
      url: config.url + '/api',
      method: 'post',
      headers: { token: config.token },
      body: {
        params,
        wsOperationName
      },
      timeout: 5000
    });

    return {
      status: 'success',
      data: response
    };
  });

  consumeRPCQueue('xyp.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.XypData.findOne({
        contentType: data?.contentType,
        contentTypeId: data?._id
      })
    };
  });
  consumeRPCQueue('xyp:insertOrUpdate', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const existingData = await models.XypData.findOne({
      contentType: data.contentType,
      contentTypeId: data.contentTypeId
    });

    const newData = data.data;

    if (!existingData) {
      return {
        status: 'success',
        data: await models.XypData.createXypData(data)
      };
    }

    for (const obj of newData) {
      const serviceIndex = existingData.data.findIndex(
        e => e.serviceName === obj.serviceName
      );

      if (serviceIndex === -1) {
        await models.XypData.updateOne(
          { _id: existingData._id },
          {
            $push: {
              data: obj
            }
          }
        );
      } else {
        existingData.data[serviceIndex] = obj;
        await models.XypData.updateOne(
          { _id: existingData._id },
          {
            $set: {
              data: existingData.data
            }
          }
        );
      }
    }

    return {
      status: 'success',
      data: await models.XypData.findOne({
        contentType: data.contentType,
        contentTypeId: data.contentTypeId
      })
    };
  });
};

export const sendSyncerkhetMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'syncerkhet',
    ...args
  });
};

export const sendPosclientMessage = async (
  args: ISendMessageArgs & {
    pos: any;
  }
) => {
  const { action, pos } = args;
  let lastAction = action;
  let serviceName = 'posclient';

  const { ALL_AUTO_INIT } = process.env;

  if (
    ![true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') &&
    !pos.onServer
  ) {
    lastAction = `posclient:${action}_${pos.token}`;
    serviceName = '';
    args.data.thirdService = true;
    args.isMQ = true;

    if (args.isRPC) {
      const response = await sendPosclientHealthCheck(args);
      if (!response || response.healthy !== 'ok') {
        throw new Error('syncing error not connected posclient');
      }
    }
  }

  args.data.token = pos.token;

  return await sendMessage({
    client,
    serviceDiscovery,
    serviceName,
    ...args,
    action: lastAction
  });
};

export const sendPosclientHealthCheck = async ({
  subdomain,
  pos
}: {
  subdomain: string;
  pos: any;
}) => {
  const { ALL_AUTO_INIT } = process.env;

  if (
    [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') ||
    pos.onServer
  ) {
    return { healthy: 'ok' };
  }

  return await sendMessage({
    subdomain,
    client,
    serviceDiscovery,
    isRPC: true,
    isMQ: true,
    serviceName: '',
    action: `posclient:health_check_${pos.token}`,
    data: { token: pos.token, thirdService: true },
    timeout: 1000,
    defaultValue: { healthy: 'no' }
  });
};
export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendAutomationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'automations',
    ...args
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
export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true
  });

export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
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

export default function() {
  return client;
}
