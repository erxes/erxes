import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService,
} from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import { publishHelper } from './graphql/resolvers/mutations/utils';
import { notifiedUserIds } from './graphql/utils';
import { getCardItem } from './utils';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeRPCQueue('growthHacks:stages.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Stages.find(data).sort({ order: 1 }).lean(),
    };
  });

  consumeRPCQueue('growthHacks:stages.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Stages.findOne(data).lean(),
    };
  });

  consumeRPCQueue('growthHacks:pipelines.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Pipelines.find(data).lean(),
    };
  });

  consumeRPCQueue('growthHacks:boards.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Boards.find(data).lean(),
    };
  });

  consumeRPCQueue('growthHacks:boards.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Boards.findOne(data).lean(),
    };
  });

  consumeRPCQueue(
    'growthHacks:boards.count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Boards.find(selector).count(),
      };
    }
  );

  consumeRPCQueue(
    'growthHacks:count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.GrowthHacks.count(selector),
      };
    }
  );

  consumeQueue(
    'growthHacks:checklists.removeChecklists',
    async ({ subdomain, data: { type, itemIds } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Checklists.removeChecklists(type, itemIds),
      };
    }
  );

  consumeRPCQueue('growthHacks:findItem', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { data: await getCardItem(models, data), status: 'success' };
  });

  consumeRPCQueue(
    'growthHacks:notifiedUserIds',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await notifiedUserIds(models, data),
      };
    }
  );

  consumeRPCQueue(
    'growthHacks:getLink',
    async ({ subdomain, data: { _id, type } }) => {
      const models = await generateModels(subdomain);

      const item = await getCardItem(models, {
        contentTypeId: _id,
        contentType: type,
      });

      if (!item) {
        return {
          status: 'error',
          errorMessage: 'Item not found',
        };
      }

      const stage = await models.Stages.getStage(item.stageId);
      const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
      const board = await models.Boards.getBoard(pipeline.boardId);

      return {
        status: 'success',
        data: `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${_id}`,
      };
    }
  );

  consumeRPCQueue(
    'growthHacks:pipelines.findOne',
    async ({ subdomain, data: { _id, stageId } }) => {
      let pipelineId = _id;
      const models = await generateModels(subdomain);
      if (!pipelineId && stageId) {
        const stage = await models.Stages.findOne({ _id: stageId }).lean();
        if (stage) {
          pipelineId = stage.pipelineId;
        }
      }

      if (!pipelineId) {
        return {
          status: 'error',
          errorMessage: 'Pipeline not found',
        };
      }

      return {
        status: 'success',
        data: await models.Pipelines.getPipeline(pipelineId),
      };
    }
  );

  consumeRPCQueue(
    'growthHacks:pipelineLabels.find',
    async ({ subdomain, data: { query, fields } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.PipelineLabels.find(query, fields),
      };
    }
  );

  consumeQueue(
    'growthHacks:pipelinesChanged',
    async ({ subdomain, data: { pipelineId, action, data } }) => {
      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: pipelineId,
          proccessId: Math.random(),
          action,
          data,
        },
      });

      return {
        status: 'success',
      };
    }
  );

  consumeQueue(
    'growthHacks:publishHelperItems',
    async ({ subdomain, data: { addedTypeIds, removedTypeIds, doc } }) => {
      const targetTypes = ['deal', 'task', 'ticket', 'purchase'];
      const targetRelTypes = ['company', 'customer'];

      if (
        targetTypes.includes(doc.mainType) &&
        targetRelTypes.includes(doc.relType)
      ) {
        await publishHelper(subdomain, doc.mainType, doc.mainTypeId);
      }

      if (
        targetTypes.includes(doc.relType) &&
        targetRelTypes.includes(doc.mainType)
      ) {
        for (const typeId of addedTypeIds.concat(removedTypeIds)) {
          await publishHelper(subdomain, doc.relType, typeId);
        }
      }

      return {
        status: 'success',
      };
    }
  );

  consumeRPCQueue(
    'growthHacks:getModuleRelation',
    async ({ subdomain, data: { module, target, triggerType } }) => {
      let filter;

      if (module.includes('contacts')) {
        const relTypeIds = await sendCommonMessage({
          subdomain,
          serviceName: 'core',
          action: 'conformities.savedConformity',
          data: {
            mainType: triggerType.split(':')[1],
            mainTypeId: target._id,
            relTypes: [module.split(':')[1]],
          },
          isRPC: true,
          defaultValue: [],
        });

        if (relTypeIds.length) {
          filter = { _id: { $in: relTypeIds } };
        }
      }

      return {
        status: 'success',
        data: filter,
      };
    }
  );
};

export const sendContactsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInternalNotesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'internalnotes',
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendFormsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args,
  });
};

export const sendEngagesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'engages',
    ...args,
  });
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendProductsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};

export const sendLogsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'logs',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};

export const sendLoyaltiesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'loyalties',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
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
    isRPC: true,
  });

export const sendTagsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};
