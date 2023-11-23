import { IContext, IModels } from '../../connectionResolver';
import { IBranchDocument } from '../../db/models/definitions/structures';

const getAllChildrenIds = async (
  models: IModels,
  parentId: string,
  allChildren: any[] = []
) => {
  const children = await models.Branches.find({
    parentId
  });

  for (const child of children) {
    console.log(child._id, 'children', parentId);
    allChildren.push(child._id);
    await getAllChildrenIds(models, child._id, allChildren);
  }

  return allChildren;
};

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Branches.findOne({ _id });
  },

  async users(branch: IBranchDocument, _args, { models }: IContext) {
    const allChildrenIds = await getAllChildrenIds(models, branch._id);

    return models.Users.findUsers({
      branchIds: { $in: [branch._id, ...allChildrenIds] },
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
    const allChildrenIds = await getAllChildrenIds(models, branch._id);

    const branchUsers = await models.Users.findUsers({
      branchIds: { $in: [branch._id, ...allChildrenIds] },
      isActive: true
    });

    const userIds = branchUsers.map(user => user._id);
    return userIds;
  },
  async userCount(branch: IBranchDocument, _args, { models }: IContext) {
    const allChildrenIds = await getAllChildrenIds(models, branch._id);

    return await models.Users.find({
      branchIds: { $in: [branch._id, ...allChildrenIds] },
      isActive: true
    }).count();
  }
};
