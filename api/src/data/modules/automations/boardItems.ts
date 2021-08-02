import { Stages } from '../../../db/models';
import { getCollection, getItem } from '../../../db/models/boardUtils';
import { graphqlPubsub } from '../../../pubsub';
import { itemsAdd } from '../../resolvers/mutations/boardUtils';
import { sendError, sendSuccess } from './utils';

export const receiveRpcMessageBoardItem = async (module, action, doc) => {
  if (action.includes('add')) {
    try {
      if (doc.conversationId) {
        doc.sourceConversationIds = [doc.conversationId];
      }

      if (doc.customerId) {
        doc.customerIds = [doc.customerId];
      }

      if (doc.companyId) {
        doc.companyIds = [doc.companyId];
      }

      const { create } = getCollection(module);

      const item = await itemsAdd(doc, module, create);

      return sendSuccess({ ...item });
    } catch (e) {
      return sendError(e.message);
    }
  }

  if (action.includes('remove')) {
    try {
      const item = await getItem(module, { ...doc });

      const stage = await Stages.getStage(item.stageId);

      const removed = item.remove();

      graphqlPubsub.publish('pipelinesChanged', {
        pipelinesChanged: {
          _id: stage.pipelineId,
          proccessId: Math.random,
          action: 'itemsRemove',
          data: {
            item,
            destinationStageId: stage._id
          }
        }
      });

      return sendSuccess({ ...removed });
    } catch (e) {
      return sendError(e.message);
    }
  }
};
