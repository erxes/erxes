import { IContext } from '../../../connectionResolver';

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
  }
};

export default rcfaIssuesMutations;
