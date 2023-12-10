import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';

function areArraysIdentical(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Iterate through each element and compare
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

const rcfaMutations = {
  async setRCFALabels(
    _root,
    { mainType, mainTypeId, labelIds },
    { models, subdomain }: IContext
  ) {
    if (!labelIds?.length) {
      throw new Error('labelIds required');
    }

    const rcfa = await models.RCFA.findOne({ mainType, mainTypeId });

    if (!rcfa) {
      throw new Error('RCFA not found');
    }

    if (!areArraysIdentical(rcfa.labelIds, labelIds)) {
      let actionIds: string[] = [];
      const issues = await models.Issues.find({ rcfaId: rcfa._id });

      for (const issue of issues) {
        actionIds = [...actionIds, ...issue.actionIds];
      }

      await sendCardsMessage({
        subdomain,
        action: 'tasks.updateMany',
        data: {
          selector: { _id: { $in: [...new Set(actionIds)] } },
          modifier: { $set: { labelIds } }
        },
        isRPC: true
      });
    }

    return await models.RCFA.findOneAndUpdate(
      { mainType, mainTypeId },
      { labelIds }
    );
  }
};

export default rcfaMutations;
