import { Boards, Pipelines } from '../../../models';
import { IBoardDocument } from '../../../models/definitions/boards';
import { IContext } from '@erxes/api-utils/src/types';

const Board = {
  __resolveReference({ _id }) {
    return Boards.findOne({ _id });
  },
  pipelines(board: IBoardDocument, {}, { user }: IContext) {
    if (board.pipelines) {
      return board.pipelines;
    }

    if (user.isOwner) {
      return Pipelines.find({
        boardId: board._id,
        status: { $ne: 'archived' }
      }).lean();
    }

    return Pipelines.find({
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

export default Board;
