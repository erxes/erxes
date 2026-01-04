import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IDoc } from './@types/common';
import { getConfig, getEbarimtData, getPostData } from './utils';
import { configs } from '~/modules/configs/db/definitions/configs';

export default {
  'sales:deal': ['update'],
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain: string,
  params: any,
) => {
  const { type, action, user } = params;

  if (type !== 'sales:deal' || action !== 'update') {
    return;
  }

  const deal = params.updatedDocument;
  const oldDeal = params.object;
  const destinationStageId = deal.stageId || '';

  if (!destinationStageId || destinationStageId === oldDeal.stageId) {
    return;
  }

  // ===== RETURN BILL =====
  const returnConfigs = await getConfig(
    subdomain,
    'returnStageInEbarimt',
    {},
  );

  if (returnConfigs[destinationStageId]) {
    const returnConfig = {
      ...(await getConfig(subdomain, 'EBARIMT', {})),
      ...returnConfigs[destinationStageId],
    };

    const returnResponses = await models.PutResponses.returnBill(
      {
        ...deal,
        contentType: 'deal',
        contentId: deal._id,
        number: deal.number,
      },
      returnConfig,
      user,
    );

    if (returnResponses.length) {
      await graphqlPubsub.publish(`automationResponded:${user._id}`, {
        automationResponded: {
          userId: user._id,
          responseId: returnResponses.map((r) => r._id).join('-'),
          sessionCode: user.sessionCode || '',
          content: returnResponses,
        },
      });
    }

    return;
  }

  // ===== PUT BILL =====
  const stageConfigs = await getConfig(subdomain, 'stageInEbarimt', {});
  const stageConfig = stageConfigs[destinationStageId];

  if (!stageConfig) {
    return;
  }

  const config = {
    ...(await getConfig(subdomain, 'EBARIMT', {})),
    ...stageConfig,
  };

  // (required usage – schema access)
  const ebarimtSchema = configs.ebarimtSchema;

  const pipeline = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pipelines',
    action: 'findOne',
    input: { stageId: destinationStageId },
    defaultValue: {},
  });

  const ebarimtData: IDoc = await getPostData(
    subdomain,
    models,
    config,
    deal,
    pipeline.paymentTypes,
  );

  const ebarimtResponses: any[] = [];

  if (config.skipPutData) {
    const { status, msg, data, innerData } = await getEbarimtData({
      config,
      doc: ebarimtData,
    });

    if (status !== 'ok') {
      ebarimtResponses.push({
        _id: nanoid(),
        id: 'Error',
        status: 'ERROR',
        message: msg,
      });
    } else {
      data &&
        ebarimtResponses.push({
          _id: nanoid(),
          ...data,
          id: 'Түр баримт',
          status: 'SUCCESS',
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
        });

      innerData &&
        ebarimtResponses.push({
          ...innerData,
          id: 'Түр баримт',
          status: 'SUCCESS',
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
    }
  } else {
    try {
      const { putData, innerData } = await models.PutResponses.putData(
        ebarimtData,
        config,
        user,
      );

      putData && ebarimtResponses.push(putData);
      innerData && ebarimtResponses.push(innerData);
    } catch (e: any) {
      ebarimtResponses.push({
        _id: nanoid(),
        id: 'Error',
        status: 'ERROR',
        message: e.message,
      });
    }
  }

  if (ebarimtResponses.length) {
    await graphqlPubsub.publish(`automationResponded:${user._id}`, {
      automationResponded: {
        userId: user._id,
        responseId: ebarimtResponses.map((r) => r._id).join('-'),
        sessionCode: user.sessionCode || '',
        content: ebarimtResponses.map((r) => ({
          ...config,
          ...r,
          description:
            (config.withDescription && deal.description) || '',
        })),
      },
    });
  }
};
