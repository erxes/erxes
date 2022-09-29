import { graphqlPubsub } from './configs';
import { IModels } from './connectionResolver';
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

        const returnResponse = await models.PutResponses.returnBill(
          { ...deal, contentType: 'deal', contentId: deal._id },
          returnConfig
        );

        try {
          await graphqlPubsub.publish('automationResponded', {
            automationResponded: {
              userId: user._id,
              responseId: returnResponse._id,
              sessionCode: user.sessionCode || '',
              content: returnResponse
            }
          });
        } catch (e) {
          throw new Error(e.message);
        }
        return;
      }

      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      const config = {
        ...configs[destinationStageId],
        ...(await getConfig(subdomain, 'EBARIMT', {}))
      };

      const ebarimtData = await getPostData(subdomain, config, deal);

      const ebarimtResponse = await models.PutResponses.putData(
        ebarimtData,
        config
      );

      try {
        await graphqlPubsub.publish('automationResponded', {
          automationResponded: {
            userId: user._id,
            responseId: ebarimtResponse._id,
            sessionCode: user.sessionCode || '',
            content: { ...config, ...ebarimtResponse, number: deal.number }
          }
        });
      } catch (e) {
        throw new Error(e.message);
      }

      return;
    }
  }
};
