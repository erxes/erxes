import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import * as moment from 'moment';
import { nanoid } from 'nanoid';
import { IModels } from './connectionResolver';
import { IDoc, getEbarimtData } from './models/utils';
import { getConfig, getPostData } from './utils';

export default {
  'cards:deal': ['update'],
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params,
) => {
  const { type, action, user } = params;

  if (type === 'cards:deal') {
    if (action === 'update') {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const configs = await getConfig(subdomain, 'stageInEbarimt', {});
      // return *********
      const returnConfigs = await getConfig(
        subdomain,
        'returnStageInEbarimt',
        {},
      );

      if (Object.keys(returnConfigs).includes(destinationStageId)) {
        const returnConfig = {
          ...returnConfigs[destinationStageId],
          ...(await getConfig(subdomain, 'EBARIMT', {})),
        };

        const returnResponses = await models.PutResponses.returnBill(
          {
            ...deal,
            contentType: 'deal',
            contentId: deal._id,
            number: deal.number,
          },
          returnConfig,
        );

        if (returnResponses.length) {
          try {
            await graphqlPubsub.publish(`automationResponded:${user._id}`, {
              automationResponded: {
                userId: user._id,
                responseId: returnResponses.map((er) => er._id).join('-'),
                sessionCode: user.sessionCode || '',
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
        ...(await getConfig(subdomain, 'EBARIMT', {})),
        ...configs[destinationStageId],
      };

      const ebarimtData: IDoc = await getPostData(subdomain, config, deal);

      let ebarimtResponse;

      if (config.skipPutData) {
        const eData = await getEbarimtData({ config, doc: ebarimtData });
        const { status, msg, data } = eData;

        if (status === 'err' || (status !== 'ok' || !data)) {
          ebarimtResponse = {
            _id: nanoid(),
            id: 'Error',
            status: 'ERROR',
            message: msg
          }
        } else {
          ebarimtResponse = {
            _id: nanoid(),
            ...data,
            id: 'Түр баримт',
            status: 'SUCCESS',
            date: moment(new Date).format('"yyyy-MM-dd HH:mm:ss'),
            registerNo: config.companyRD || '',
          };
        }

      } else {
        try {
          ebarimtResponse = await models.PutResponses.putData(
            ebarimtData,
            config,
          );
        } catch (e) {
          ebarimtResponse = {
            _id: nanoid(),
            id: 'Error',
            status: 'ERROR',
            message: e.message
          }
        }
      }

      try {
        if (ebarimtResponse) {
          await graphqlPubsub.publish(`automationResponded:${user._id}`, {
            automationResponded: {
              userId: user._id,
              responseId: ebarimtResponse.id,
              sessionCode: user.sessionCode || '',
              content: [{ ...config, ...ebarimtResponse }],
            },
          });
        }
      } catch (e) {
        throw new Error(e.message);
      }

      return;
    }
  }
};
