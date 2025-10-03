import { IContext } from '~/connectionResolvers';

import { IModels } from '~/connectionResolvers';
import { IPositionDocument } from '@/organization/structure/@types/structure';

const getAllChildrenIds = async (models: IModels, parentId: string) => {
  const pipeline = [
    {
      $match: { parentId }, // Match the starting parent
    },
    {
      $graphLookup: {
        from: 'positions', // Collection name
        startWith: '$_id', // Assuming '_id' is the unique identifier
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
        depthField: 'depth',
      },
    },
  ];

  const result = await models.Positions.aggregate(pipeline).exec();

  return result.map((r) => r._id);
};

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Positions.findOne({ _id });
  },

  async users(
    position: IPositionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    const allChildrenIds = await getAllChildrenIds(models, position._id);

    return models.Users.findUsers({
      positionIds: { $in: [position._id, ...allChildrenIds] },
      isActive: true,
    });
  },

  async parent(
    position: IPositionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Positions.findOne({ _id: position.parentId });
  },

  async children(
    position: IPositionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Positions.find({ parentId: position._id });
  },

  async supervisor(
    position: IPositionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Users.findOne({ _id: position.supervisorId, isActive: true });
  },

  async userIds(
    position: IPositionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    const allChildrenIds = await getAllChildrenIds(models, position._id);

    const positionedUsers = await models.Users.findUsers({
      positionIds: { $in: [position._id, ...allChildrenIds] },
      isActive: true,
    });

    const userIds = positionedUsers.map((user) => user._id);
    return userIds;
  },
  async userCount(
    position: IPositionDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    const allChildrenIds = await getAllChildrenIds(models, position._id);

    return await models.Users.countDocuments({
      positionIds: { $in: [position._id, ...allChildrenIds] },
      isActive: true,
    });
  },
};
