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

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
