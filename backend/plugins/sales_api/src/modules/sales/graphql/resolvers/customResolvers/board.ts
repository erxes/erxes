import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IBoardDocument } from '~/modules/sales/@types';

export default {
  async pipelines(
    board: IBoardDocument,
    _args: undefined,
    { user, models }: IContext,
  ) {
    if (board.pipelines) {
      return board.pipelines;
    }

    if (user.isOwner) {
      return models.Pipelines.find({
        boardId: board._id,
        status: { $ne: 'archived' },
      }).lean();
    }

    const userDetail = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: {
        _id: user._id,
      },
      defaultValue: {},
    });

    const userDepartmentIds = userDetail?.departmentIds || [];
    const branchIds = userDetail?.branchIds || [];

    const supervisorDepartmentIds = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'departments',
      action: 'findWithChild',
      input: {
        query: {
          supervisorId: user._id,
        },
        fields: {
          _id: 1,
        },
      },
      defaultValue: [],
    });

    const departmentIds = [
      ...userDepartmentIds,
      ...(supervisorDepartmentIds.map((x) => x._id) || []),
    ];

    const query: any = {
      $and: [
        { status: { $ne: 'archived' } },
        { boardId: board._id },
        {
          $or: [
            { visibility: 'public' },
            {
              visibility: 'private',
              $or: [{ memberIds: { $in: [user._id] } }, { userId: user._id }],
            },
          ],
        },
      ],
    };

    if (departmentIds.length > 0) {
      query.$and[2].$or.push({
        $and: [
          { visibility: 'private' },
          { departmentIds: { $in: departmentIds } },
        ],
      });
    }
    if (branchIds.length > 0) {
      query.$and[2].$or.push({
        $and: [{ visibility: 'private' }, { branchIds: { $in: branchIds } }],
      });
    }

    return await models.Pipelines.find(query).lean();
  },
};
