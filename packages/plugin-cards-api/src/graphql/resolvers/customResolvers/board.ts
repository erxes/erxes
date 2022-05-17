import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import { IBoardDocument } from "../../../models/definitions/boards";

export default {
  async pipelines(
    board: IBoardDocument,
    {},
    { user, models, subdomain }: IContext
  ) {
    if (board.pipelines) {
      return board.pipelines;
    }

    if (user.isOwner) {
      return models.Pipelines.find({
        boardId: board._id,
        status: { $ne: "archived" },
      }).lean();
    }

    const departments = await sendCoreMessage({
      subdomain,
      action: "departments.find",
      data: {
        userIds: { $in: [user._id] },
      },
      isRPC: true,
      defaultValue: [],
    });

    const departmentIds = departments.map(d => d._id);

    const query: any = {
      $and: [
        { status: { $ne: "archived" } },
        { boardId: board._id },
        {
          $or: [
            { visibility: "public" },
            {
              visibility: "private",
              $or: [{ memberIds: { $in: [user._id] } }, { userId: user._id }],
            },
          ],
        },
      ],
    };

    if (departmentIds.length > 0) {
      query.$and[2].$or.push({
        $and: [
          { visibility: "private" },
          { departmentIds: { $in: departmentIds } },
        ],
      });
    }

    return models.Pipelines.find(query).lean();
  },
};
