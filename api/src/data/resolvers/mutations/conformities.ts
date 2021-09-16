import { Conformities, Stages } from '../../../db/models';
import { getItem } from '../../../db/models/boardUtils';
import {
  IConformityAdd,
  IConformityEdit
} from '../../../db/models/definitions/conformities';
import { graphqlPubsub } from '../../../pubsub';

const publishHelper = async (type: string, itemId: string) => {
  const item = await getItem(type, { _id: itemId });
  const stage = await Stages.getStage(item.stageId);

  graphqlPubsub.publish('pipelinesChanged', {
    pipelinesChanged: {
      _id: stage.pipelineId,
      proccessId: Math.random().toString(),
      action: 'itemOfConformitiesUpdate',
      data: {
        item: {
          ...item._doc
        }
      }
    }
  });
};

const conformityMutations = {
  /**
   * Create new conformity
   */
  async conformityAdd(_root, doc: IConformityAdd) {
    return Conformities.addConformity({ ...doc });
  },

  /**
   * Edit conformity
   */
  async conformityEdit(_root, doc: IConformityEdit) {
    const { addedTypeIds, removedTypeIds } = await Conformities.editConformity({
      ...doc
    });

    const targetTypes = ['deal', 'task', 'ticket'];
    const targetRelTypes = ['company', 'customer'];
    if (
      targetTypes.includes(doc.mainType) &&
      targetRelTypes.includes(doc.relType)
    ) {
      await publishHelper(doc.mainType, doc.mainTypeId);
    }

    if (
      targetTypes.includes(doc.relType) &&
      targetRelTypes.includes(doc.mainType)
    ) {
      for (const typeId of addedTypeIds.concat(removedTypeIds)) {
        await publishHelper(doc.relType, typeId);
      }
    }
  }
};

export default conformityMutations;
