import { Pipelines } from '../../db/models';
import { IBoardDocument } from '../../db/models/definitions/boards';
import { IUserDocument } from '../../db/models/definitions/users';

export default {
  pipelines(board: IBoardDocument, {}, { user }: { user: IUserDocument }) {
    if (user.isOwner) {
      return Pipelines.find({ boardId: board._id });
    }

    return Pipelines.find({
      $and: [
        { boardId: board._id },
        {
          $or: [
            { visibility: 'public' },
            { visibility: 'private', $or: [{ memberIds: user._id }, { userId: user._id }] },
          ],
        },
      ],
    });
  },
};
