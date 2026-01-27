import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IDoc } from './@types/common';
import { getEbarimtData, getPostData } from './utils';


export const afterMutationHandlers = async (
  models: IModels,
  subdomain: string,
  processId: string,
  params: any,
) => {
  const {
    destinationStageId,
    deal,
    userId
  } = params;

  const mainConfig = await models.Configs.getConfigValue('EBARIMT')

  if (!mainConfig) {
    return;
  }

  // return PutResponse
  const returnConfigVal = await models.Configs.getConfigValue(
    'returnStageInEbarimt',
    destinationStageId
  );

  if (returnConfigVal) {
    const returnConfig = {
      ...returnConfigVal,
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
        await graphqlPubsub.publish(`ebarimtResponded:${userId}`, {
          ebarimtResponded: {
            userId,
            responseId: returnResponses.map((er) => er._id).join('-'),
            processId,
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
  const configVal = await models.Configs.getConfigValue('stageInEbarimt', destinationStageId);
  if (!configVal) {
    return;
  }

  const config = {
    ...mainConfig,
    ...configVal,
  };

  const pipeline = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: 'pipeline',
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
      await graphqlPubsub.publish(`ebarimtResponded:${userId}`, {
        ebarimtResponded: {
          userId,
          responseId: ebarimtResponses.map((er) => er._id).join('-'),
          processId,
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
