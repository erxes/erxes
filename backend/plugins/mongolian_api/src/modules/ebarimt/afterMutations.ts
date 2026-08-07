import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IDoc } from './@types/common';
import {
  EbarimtEmailDeal,
  EbarimtEmailResponse,
  sendEbarimtEmail,
} from './sendEbarimtEmail';
import { getPutResponseDetail } from './getPutResponseDetail';
import { getEbarimtData, getPostData } from './utils';

interface AfterMutationParams {
  deal: EbarimtEmailDeal & { description?: string };
  destinationStageId: string;
  processId?: string;
  sessionCode: string;
  sourceStageId?: string;
  userId: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const afterMutationHandlers = async (
  models: IModels,
  subdomain: string,
  processId: string,
  params: AfterMutationParams,
) => {
  const { destinationStageId, deal, sessionCode, userId } = params;

  const mainConfig = await models.Configs.getConfigValue('EBARIMT');

  if (!mainConfig) {
    return;
  }

  // return PutResponse
  const returnConfigVal = await models.Configs.getConfigValue(
    'returnStageInEbarimt',
    destinationStageId,
  );

  if (returnConfigVal) {
    const returnConfig = {
      ...mainConfig,
      ...returnConfigVal,
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
            sessionCode,
            content: returnResponses,
          },
        });
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    }

    return;
  }

  // put *******
  const configVal = await models.Configs.getConfigValue(
    'stageInEbarimt',
    destinationStageId,
  );
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
    input: { stageId: destinationStageId, fields: { paymentTypes: 1 } },
    defaultValue: {},
  });

  const ebarimtData: IDoc = await getPostData(
    subdomain,
    models,
    config,
    deal,
    pipeline.paymentTypes,
  );

  const ebarimtResponses: EbarimtEmailResponse[] = [];

  if (config.skipEbarimt) {
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
          date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          registerNo: config.companyRD || '',
        });
      }
      if (innerData) {
        ebarimtResponses.push({
          ...innerData,
          id: 'Түр баримт',
          status: 'SUCCESS',
          date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
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

      if (putData) ebarimtResponses.push(putData);
      if (innerData) ebarimtResponses.push(innerData);
    } catch (error) {
      ebarimtResponses.push({
        _id: nanoid(),
        id: 'Error',
        status: 'ERROR',
        message: getErrorMessage(error),
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
          sessionCode,
          content: ebarimtResponses.map((er) => ({
            ...config,
            ...er,
            description: (config.withDescription && deal.description) || '',
          })),
        },
      });
    }
  } catch (error) {
    console.error(
      'Failed to publish eBarimt response:',
      getErrorMessage(error),
    );
  }

  if (config.sendEmail) {
    try {
      const fallbackEmailResponses: EbarimtEmailResponse[] =
        ebarimtResponses.map((response) => ({
          ...config,
          ...response,
          description: (config.withDescription && deal.description) || '',
        }));
      let emailResponses = fallbackEmailResponses;

      if (!config.skipEbarimt) {
        try {
          const responseDetail = await getPutResponseDetail({
            contentType: 'deal',
            contentId: deal._id,
            models,
            subdomain,
          });

          if (responseDetail) {
            emailResponses = [
              {
                ...config,
                ...responseDetail,
                description: (config.withDescription && deal.description) || '',
              },
            ];
          }
        } catch (error) {
          console.error(
            'Failed to load eBarimt detail for email:',
            getErrorMessage(error),
          );
          emailResponses = fallbackEmailResponses;
        }
      }

      await sendEbarimtEmail({
        deal,
        responses: emailResponses,
        subdomain,
      });
    } catch (error) {
      console.error('Failed to send eBarimt email:', getErrorMessage(error));
    }
  }
};
