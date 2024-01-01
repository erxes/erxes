import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';
import { areArraysIdentical } from './rcfa';

interface ICreateQuestion {
  question: string;
  parentId: string;
  mainType: string;
  mainTypeId: string;
}

const rcfaIssuesMutations = {
  async addRcfaIssue(
    _root: any,
    args: ICreateQuestion,
    { models, user }: IContext
  ) {
    return await models.Issues.addIssue(args, user);
  },

  async editRcfaIssue(_root, { _id, doc }, { models }: IContext) {
    return await models.Issues.editIssue(_id, doc);
  },

  async deleteRcfaIssue(_root, { _id }, { models }: IContext) {
    return await models.Issues.removeIssue(_id);
  },
  async closeRcfaRoot(_root, { _id }, { models }: IContext) {
    return await models.Issues.closeRootIssue(_id);
  },
  async createActionRcfaRoot(_root, params, { models }: IContext) {
    return await models.Issues.createActionRcfaRoot(params);
  },
  async createTaskRcfaRoot(_root, params, { models }: IContext) {
    return await models.Issues.createTaskRcfaRoot(params);
  },
  async createAssessmentOfRcfa(_root, params, { models }: IContext) {
    return await models.RCFA.createAssessment(params);
  },
  async setLabelsRcfaIssues(
    _root,
    { issueId, labelIds },
    { models, subdomain }: IContext
  ) {
    if (!labelIds?.length) {
      throw new Error('labelIds required');
    }

    const issue = await models.Issues.findOne({ _id: issueId });

    if (!issue) {
      throw new Error('Not found');
    }

    if (!areArraysIdentical(issue.labelIds, labelIds)) {
      const { actionIds = [], taskIds = [] } = issue;

      let cardIds: string[] = [...actionIds, ...taskIds];

      await sendCardsMessage({
        subdomain,
        action: 'tasks.updateMany',
        data: {
          selector: { _id: { $in: [...new Set(cardIds)] } },
          modifier: { $set: { labelIds } }
        },
        isRPC: true
      });
    }

    return await models.Issues.findOneAndUpdate(
      {
        _id: issueId
      },
      { $set: { labelIds } }
    );
  }
};

export default rcfaIssuesMutations;
