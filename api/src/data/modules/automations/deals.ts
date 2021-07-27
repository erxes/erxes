import { Deals, Stages } from '../../../db/models';
import { graphqlPubsub } from '../../../pubsub';
import { sendError, sendSuccess } from './utils';

export const receiveRpcMessageDeals = async (action, doc) => {
  if (action === 'add-deal') {
    try {
      const deal = await Deals.createDeal({ ...doc });

      const stage = await Stages.getStage(deal.stageId);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: doc.proccessId,
          action: 'itemAdd',
          data: {
            deal,
            aboveItemId: doc.aboveItemId,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ deal });
    } catch (e) {
      return sendError(e.message);
    }
  }

  if (action === 'remove-deal') {
    try {
      const deal = await Deals.findOne({ ...doc });
      if (!deal) {
        return sendError('Deal not found');
      }

      const stage = await Stages.getStage(deal.stageId);

      const result = await Deals.removeDeals([deal._id]);

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: Math.random,
          action: 'itemsRemove',
          data: {
            deal,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ ...result });
    } catch (e) {
      return sendError(e.message);
    }
  }
};
