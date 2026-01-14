import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IDoc } from './@types/common';
import { getConfig, getEbarimtData, getPostData } from './utils';


export const afterMutationHandlers = async (
  models: IModels,
  subdomain: string,
  processId: string,
  params: any,
) => {
  const {
    sourceStageId,
    destinationStageId,
    deal,
    userId
  } = params;

  const mainConfig = await getConfig(subdomain, 'EBARIMT', {});

  if (!mainConfig) {
    return;
  }

  const configs = await getConfig(subdomain, 'stageInEbarimt', {});
  const returnConfigs = await getConfig(
    subdomain,
    'returnStageInEbarimt',
    {},
  );

  if (Object.keys(returnConfigs).includes(destinationStageId)) {
    const returnConfig = {
      ...returnConfigs[destinationStageId],
      ...mainConfig,
    };

    const returnResponses = await models.PutResponses.returnBill(
      {
        ...deal,
        contentType: 'deal',
        contentId: deal._id,
        number: deal.number,
      },
      returnConfig,
      userId,
    );

    if (returnResponses.length) {
      try {
        await graphqlPubsub.publish(`automationResponded:${userId}`, {
          automationResponded: {
            userId,
            responseId: returnResponses.map((er) => er._id).join('-'),
            // sessionCode: user.sessionCode || '',
            content: returnResponses,
          },
        });
      } catch (e) {
        throw new Error(e.message);
      }
    }

    return;
  }

  // put *******
  if (!Object.keys(configs).includes(destinationStageId)) {
    return;
  }

  const config = {
    ...mainConfig,
    ...configs[destinationStageId],
  };

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

    if (status !== 'ok' || (!data && !innerData)) {
      ebarimtResponses.push({
        _id: nanoid(),
        id: 'Error',
        status: 'ERROR',
        message: msg,
      });
    } else {
      if (data) {
        ebarimtResponses.push({
          _id: nanoid(),
          ...data,
          id: 'Түр баримт',
          status: 'SUCCESS',
          date: moment(new Date()).format('"yyyy-MM-dd HH:mm:ss'),
          registerNo: config.companyRD || '',
        });
      }
      if (innerData) {
        ebarimtResponses.push({
          ...innerData,
          id: 'Түр баримт',
          status: 'SUCCESS',
          date: moment(new Date()).format('"yyyy-MM-dd HH:mm:ss'),
          registerNo: config.companyRD || '',
        });
      }
    }
  } else {
    try {
      const { putData, innerData } = await models.PutResponses.putData(
        ebarimtData,
        config,
        userId,
      );

      putData && ebarimtResponses.push(putData);
      innerData && ebarimtResponses.push(innerData);
    } catch (e) {
      ebarimtResponses.push({
        _id: nanoid(),
        id: 'Error',
        status: 'ERROR',
        message: e.message,
      });
    }
  }

  try {
    if (ebarimtResponses.length) {
      await graphqlPubsub.publish(`automationResponded:${userId}`, {
        automationResponded: {
          userId,
          responseId: ebarimtResponses.map((er) => er._id).join('-'),
          // sessionCode: user.sessionCode || '',
          content: ebarimtResponses.map((er) => ({
            ...config,
            ...er,
            description: (config.withDescription && deal.description) || '',
          })),
        },
      });
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
