import { IContext } from '../../../connectionResolver';
import { IBoardDocument } from '../../../models/definitions/boards';

export default {
  pipelines(board: IBoardDocument, {}, { user, models }: IContext) {
    if (board.pipelines) {
      return board.pipelines;
    }

    if (user.isOwner) {
      return models.Pipelines.find({
        boardId: board._id,
        status: { $ne: 'archived' }
      }).lean();
    }

    return models.Pipelines.find({
      $and: [
        { status: { $ne: 'archived' } },
        { boardId: board._id },
        {
          $or: [
            { visibility: 'public' },
            {
              visibility: 'private',
              $or: [{ memberIds: user._id }, { userId: user._id }]
            }
          ]
        }
      ]
    }).lean();
  }
};
