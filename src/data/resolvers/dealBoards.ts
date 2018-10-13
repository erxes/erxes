import { DealPipelines } from '../../db/models';
import { IBoardDocument } from '../../db/models/definitions/deals';

export default {
  pipelines(board: IBoardDocument) {
    return DealPipelines.find({ boardId: board._id });
  },
};
