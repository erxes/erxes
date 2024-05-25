import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage as sendMessageCore,
} from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import {
  fetchSegment,
  isInSegment,
} from './graphql/resolvers/queries/queryBuilder';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

const sendSuccessMessage = (data) => ({ data, status: 'success' });
const sendErrorMessage = (message?) => ({
  status: 'error',
  message,
});

export const setupMessageConsumers = async () => {
  consumeRPCQueue('segments:findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Segments.findOne(data).lean(),
      status: 'success',
    };
  });

  consumeRPCQueue('segments:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await models.Segments.find(data).lean(), status: 'success' };
  });

  consumeRPCQueue(
    'segments:count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.Segments.find(selector).countDocuments(),
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'segments:fetchSegment',
    async ({ subdomain, data: { segmentId, options, segmentData } }) => {
      const models = await generateModels(subdomain);

      const segment = segmentData
        ? segmentData
        : await models.Segments.findOne({ _id: segmentId }).lean();

      return {
        data: await fetchSegment(models, subdomain, segment, options),
        status: 'success',
      };
    },
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
        options,
      );

      return { data, status: 'success' };
    },
  );

  consumeQueue(
    'segments:removeSegment',
    async ({ subdomain, data: { segmentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Segments.removeSegment(segmentId),
      };
    },
  );

  consumeRPCQueue(
    'segments:findSubSegments',
    async ({ subdomain, data: { segmentIds } }) => {
      const models = await generateModels(subdomain);

      const segments = await models.Segments.find({ _id: { $in: segmentIds } });

      if (!segments?.length) {
        return {
          status: 'error',
          errorMessage: 'Segments not found',
        };
      }

      let subSegmentIds: string[] = [];

      for (const { conditions } of segments || []) {
        for (const { subSegmentId } of conditions || []) {
          if (subSegmentId) {
            subSegmentIds.push(subSegmentId);
          }
        }
      }

      return {
        status: 'success',
        data: await models.Segments.find({
          _id: {
            $in: subSegmentIds,
          },
        }),
      };
    },
  );
};

export const sendMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessageCore({ ...args });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessageCore({
    serviceName: 'core',
    ...args,
  });
};
