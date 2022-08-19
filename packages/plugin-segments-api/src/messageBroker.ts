import {
  ISendMessageArgs,
  sendMessage as sendMessageCore
} from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import {
  fetchSegment,
  isInSegment
} from './graphql/resolvers/queries/queryBuilder';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('segments:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Segments.findOne(data).lean(),
      status: 'success'
    };
  });

  consumeRPCQueue('segments:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await models.Segments.find(data).lean(), status: 'success' };
  });

  consumeRPCQueue(
    'segments:fetchSegment',
    async ({ subdomain, data: { segmentId, options } }) => {
      const models = await generateModels(subdomain);
      const segment = await models.Segments.findOne({ _id: segmentId }).lean();

      return {
        data: await fetchSegment(models, subdomain, segment, options),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'segments:isInSegment',
    async ({ subdomain, data: { segmentId, idToCheck, options } }) => {
      const models = await generateModels(subdomain);

      const data = await isInSegment(
        models,
        subdomain,
        segmentId,
        idToCheck,
        options
      );

      return { data, status: 'success' };
    }
  );

  consumeQueue(
    'segments:removeSegment',
    async ({ subdomain, data: { segmentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Segments.removeSegment(segmentId)
      };
    }
  );
};

export const sendMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, ...args });
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export default function() {
  return client;
}
