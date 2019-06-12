import { Boards, Pipelines, Stages } from '../../../db/models';
import { IBoard, IOrderInput, IPipeline, IStageDocument } from '../../../db/models/definitions/boards';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission } from '../boardUtils';

interface IBoardsEdit extends IBoard {
  _id: string;
}

interface IPipelinesAdd extends IPipeline {
  stages: IStageDocument[];
}

interface IPipelinesEdit extends IPipelinesAdd {
  _id: string;
}

const boardMutations = {
  /**
   * Create new board
   */
  async boardsAdd(_root, doc: IBoard, { user }: { user: IUserDocument }) {
    await checkPermission(doc.type, user, 'boardsAdd');

    return Boards.createBoard({ userId: user._id, ...doc });
  },

  /**
   * Edit board
   */
  async boardsEdit(_root, { _id, ...doc }: IBoardsEdit, { user }: { user: IUserDocument }) {
    await checkPermission(doc.type, user, 'boardsEdit');

    return Boards.updateBoard(_id, doc);
  },

  /**
   * Remove board
   */
  async boardsRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const board = await Boards.findOne({ _id });

    if (board) {
      await checkPermission(board.type, user, 'boardsRemove');
    }

    return Boards.removeBoard(_id);
  },

  /**
   * Create new pipeline
   */
  async pipelinesAdd(_root, { stages, ...doc }: IPipelinesAdd, { user }: { user: IUserDocument }) {
    await checkPermission(doc.type, user, 'pipelinesAdd');

    return Pipelines.createPipeline({ userId: user._id, ...doc }, stages);
  },

  /**
   * Edit pipeline
   */
  async pipelinesEdit(_root, { _id, stages, ...doc }: IPipelinesEdit, { user }: { user: IUserDocument }) {
    await checkPermission(doc.type, user, 'pipelinesEdit');

    return Pipelines.updatePipeline(_id, doc, stages);
  },

  /**
   * Update pipeline orders
   */
  async pipelinesUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Pipelines.updateOrder(orders);
  },

  /**
   * Remove pipeline
   */
  async pipelinesRemove(_root, { _id }: { _id: string }, { user }: { user: IUserDocument }) {
    const pipeline = await Pipelines.findOne({ _id });

    if (pipeline) {
      await checkPermission(pipeline.type, user, 'pipelinesRemove');
    }

    return Pipelines.removePipeline(_id);
  },

  /**
   * Update stage orders
   */
  stagesUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Stages.updateOrder(orders);
  },
};

export default boardMutations;
