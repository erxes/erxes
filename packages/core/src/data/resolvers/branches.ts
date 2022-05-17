import { IContext } from '../../connectionResolver';
import { IBranchDocument } from '../../db/models/definitions/structures';

export default {
  users(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Users.find({ _id: { $in: branch.userIds || [] }, isActive: true });
  },

  parent(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Branches.findOne({ _id: branch.parentId });
  },

  children(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Branches.find({ parentId: branch._id });
  },

  supervisor(branch: IBranchDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: branch.supervisorId, isActive: true });
  }
};
