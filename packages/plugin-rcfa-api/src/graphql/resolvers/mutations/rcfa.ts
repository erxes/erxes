import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';

const rcfaMutations = {
  async resolveRCFA(_root, args, { models, subdomain }: IContext) {
    const {
      mainType,
      mainTypeId,
      destinationType,
      destinationStageId,
      issueId
    } = args;

    if (!destinationType || !destinationStageId || !issueId) {
      throw new Error('Cannot resolve rcfa');
    }

    const rcfa = await models.RCFA.findOne({ mainType, mainTypeId });

    if (!rcfa) {
      throw new Error('Something went wrong');
    }

    const issue = await models.Issues.findOne({ _id: issueId });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const payload = {
      type: destinationType,
      sourceType: mainType,
      itemId: mainTypeId,
      name: issue?.issue || '',
      stageId: destinationStageId
    };

    const newItem = await sendCardsMessage({
      subdomain: subdomain,
      action: 'createRelatedItem',
      data: payload,
      isRPC: true
    });

    await models.Issues.updateOne({ _id: issue?._id }, { isRootCause: true });
    await models.Issues.closeRootIssue(issue?._id);

    return await models.RCFA.updateOne(
      { _id: rcfa._id },
      {
        $set: {
          status: 'resolved',
          closedAt: new Date(),
          relTypeId: newItem._id,
          relType: destinationType
        }
      }
    );
  }
};

export default rcfaMutations;
