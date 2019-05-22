import { DealPipelines } from '../../db/models';
import { IBoardDocument } from '../../db/models/definitions/deals';
import { IUserDocument } from '../../db/models/definitions/users';

export default {
  pipelines(board: IBoardDocument, {}, { user }: { user: IUserDocument }) {
    if (user.isOwner) {
      return DealPipelines.find({ boardId: board._id });
    }

    return DealPipelines.find({
      $and: [
        { boardId: board._id },
        {
          $or: [
            { visiblity: 'public' },
            { visiblity: 'private', $or: [{ memberIds: user._id }, { userId: user._id }] },
          ],
        },
      ],
    });
  },
};
