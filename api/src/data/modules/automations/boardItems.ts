import { Conformities, Stages } from '../../../db/models';
import { getCollection, getItem } from '../../../db/models/boardUtils';
import { graphqlPubsub } from '../../../pubsub';
import { itemsAdd } from '../../resolvers/mutations/boardUtils';
import { sendSuccess } from './utils';

export const receiveRpcMessageBoardItem = async (action, doc) => {
  const { type } = doc;

  if (action.includes('add')) {
    try {
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
};
