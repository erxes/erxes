import { Conformities, Deals, Stages } from '../../../db/models';
import { getCollection, getItem } from '../../../db/models/boardUtils';
import { graphqlPubsub } from '../../../pubsub';
import { itemsAdd } from '../../resolvers/mutations/boardUtils';
import { sendError, sendSuccess } from './utils';

export const receiveRpcMessageBoardItem = async (action, doc) => {
  const { type } = doc;

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

      // 'dealStage change'
      const { create } = getCollection(type);

      const item = await itemsAdd(doc, type, create);

      return sendSuccess({ ...item });
    } catch (e) {
      return sendError(e.message);
    }
  }

  if (action.includes('remove')) {
    try {
      const item = await getItem(type, { ...doc });

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

  if (action.includes('findConformities')) {
    const conformities = await Conformities.getConformities({
      mainType: doc.mainType,
      mainTypeIds: [doc.mainTypeId],
      relTypes: [doc.relType]
    });

    return sendSuccess(conformities);
  }

  if (action.includes('set-property')) {
    if (doc.module === 'deal') {
      const result = await Deals.update(
        { _id: doc._id },
        { $set: { [doc.field]: doc.value } }
      );

      return sendSuccess(result);
    }
  }
};
