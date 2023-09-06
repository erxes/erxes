import { graphqlPubsub } from './configs';
import { IModels } from './connectionResolver';
import { PutData } from './models/utils';
import { getConfig, getPostData } from './utils';

export default {
  'cards:deal': ['update']
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params
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
        {}
      );

      if (Object.keys(returnConfigs).includes(destinationStageId)) {
        const returnConfig = {
          ...returnConfigs[destinationStageId],
          ...(await getConfig(subdomain, 'EBARIMT', {}))
        };

        const returnResponses = await models.PutResponses.returnBill(
          {
            ...deal,
            contentType: 'deal',
            contentId: deal._id,
            number: deal.number
          },
          returnConfig
        );

        if (returnResponses.length) {
          try {
            await graphqlPubsub.publish('automationResponded', {
              automationResponded: {
                userId: user._id,
                responseId: returnResponses.map(er => er._id).join('-'),
                sessionCode: user.sessionCode || '',
                content: returnResponses
              }
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
        ...configs[destinationStageId],
        ...(await getConfig(subdomain, 'EBARIMT', {}))
      };

      const ebarimtDatas = await getPostData(subdomain, config, deal);

      const ebarimtResponses: any[] = [];

      for (const ebarimtData of ebarimtDatas) {
        let ebarimtResponse;

        if (config.skipPutData || ebarimtData.inner) {
          const putData = new PutData({
            ...config,
            ...ebarimtData,
            config,
            models
          });
          ebarimtResponse = {
            _id: Math.random(),
            billId: 'Түр баримт',
            ...(await putData.generateTransactionInfo()),
            registerNo: config.companyRD || ''
          };
        } else {
          ebarimtResponse = await models.PutResponses.putData(
            ebarimtData,
            config
          );
        }
        if (ebarimtResponse._id) {
          ebarimtResponses.push(ebarimtResponse);
        }
      }

      try {
        if (ebarimtResponses.length) {
          await graphqlPubsub.publish('automationResponded', {
            automationResponded: {
              userId: user._id,
              responseId: ebarimtResponses.map(er => er._id).join('-'),
              sessionCode: user.sessionCode || '',
              content: ebarimtResponses.map(er => ({ ...config, ...er }))
            }
          });
        }
      } catch (e) {
        throw new Error(e.message);
      }

      return;
    }
  }
};
