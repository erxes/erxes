import { IContext, IModels } from '../../connectionResolver';
import { IPositionDocument } from '../../db/models/definitions/structures';

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
  __resolveReference({ _id }, { models }: IContext) {
    return models.Positions.findOne({ _id });
  },

  async users(position: IPositionDocument, _args, { models }: IContext) {
    const allChildrenIds = await getAllChildrenIds(models, position._id);

    return models.Users.findUsers({
      positionIds: { $in: [position._id, ...allChildrenIds] },
      isActive: true,
    });
  },

  parent(position: IPositionDocument, _args, { models }: IContext) {
    return models.Positions.findOne({ _id: position.parentId });
  },

  children(position: IPositionDocument, _args, { models }: IContext) {
    return models.Positions.find({ parentId: position._id });
  },

  supervisor(position: IPositionDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: position.supervisorId, isActive: true });
  },

  async userIds(position: IPositionDocument, _args, { models }: IContext) {
    const allChildrenIds = await getAllChildrenIds(models, position._id);

    const positionedUsers = await models.Users.findUsers({
      positionIds: { $in: [position._id, ...allChildrenIds] },
      isActive: true,
    });

    const userIds = positionedUsers.map((user) => user._id);
    return userIds;
  },
  async userCount(position: IPositionDocument, _args, { models }: IContext) {
    const allChildrenIds = await getAllChildrenIds(models, position._id);

    return await models.Users.find({
      positionIds: { $in: [position._id, ...allChildrenIds] },
      isActive: true,
    }).countDocuments();
  },
};
