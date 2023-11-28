import { IContext, IModels } from '../../connectionResolver';
import { IBranchDocument } from '../../db/models/definitions/structures';

const getAllChildrenIds = async (models: IModels, parentId: string) => {
  const pipeline = [
    {
      $match: { parentId } // Match the starting parent
    },
    {
      $graphLookup: {
        from: 'branches', // Collection name
        startWith: '$_id', // Assuming '_id' is the unique identifier
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        depthField: 'depth'
      }
    }
  ];

  const result = await models.Branches.aggregate(pipeline).exec();

  return result.map(r => r._id);
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
