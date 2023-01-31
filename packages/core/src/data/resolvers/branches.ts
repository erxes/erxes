import { IContext } from '../../connectionResolver';
import { IBranchDocument } from '../../db/models/definitions/structures';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Branches.findOne({ _id });
  },

  async users(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Users.findUsers({
      branchIds: { $in: branch._id },
      isActive: true
    });
  },

  parent(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Branches.findOne({ _id: branch.parentId });
  },

  children(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Branches.find({ parentId: branch._id });
  },

  supervisor(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: branch.supervisorId, isActive: true });
  },

  async userIds(branch: IBranchDocument, _args, { models }: IContext) {
    const branchUsers = await models.Users.findUsers({
      branchIds: { $in: branch._id },
      isActive: true
    });

    const userIds = branchUsers.map(user => user._id);
    return userIds;
  },
  async userCount(branch: IBranchDocument, _args, { models }: IContext) {
    return await models.Users.countDocuments({
      branchIds: { $in: branch._id },
      isActive: true
    });
  }
};
