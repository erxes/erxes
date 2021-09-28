import {
  Companies,
  Conformities,
  Conversations,
  Customers,
  Deals,
  Stages,
  Tasks,
  Tickets
} from '../../../db/models';
import { getCollection, getItem } from '../../../db/models/boardUtils';
import { graphqlPubsub } from '../../../pubsub';
import { itemsAdd } from '../../resolvers/mutations/boardUtils';
import { sendSuccess } from './utils';

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

      if (doc.conformity) {
        await Conformities.addConformity({
          ...doc.conformity,
          relTypeId: item._id
        });
      }

      return sendSuccess(item);
    } catch (e) {
      return sendSuccess({ error: e.message });
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
      return sendSuccess({ error: e.message });
    }
  }

  let collection;
  const modules = {
    deal: Deals,
    customer: Customers,
    task: Tasks,
    ticket: Tickets,
    company: Companies,
    conversation: Conversations
  };

  if (action.includes('findConformities')) {
    const conformities = await Conformities.savedConformity({
      mainType: doc.mainType,
      mainTypeId: doc.mainTypeId,
      relTypes: [doc.relType]
    });
    collection = modules[doc.relType];

    return sendSuccess(await collection.find({ _id: { $in: conformities } }));
  }

  if (action.includes('set-property')) {
    try {
      collection = modules[doc.module];

      const result = await collection.update(
        { _id: doc._id },
        { $set: { ...(doc.setDoc || {}) } }
      );

      return sendSuccess(result);
    } catch (e) {
      return sendSuccess({ error: e.message });
    }
  }
};
