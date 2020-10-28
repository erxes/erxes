import { Boards, Pipelines, Stages } from '../../../db/models';
import {
  IBoard,
  IOrderInput,
  IPipeline,
  IStage,
  IStageDocument
} from '../../../db/models/definitions/boards';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { IContext } from '../../types';
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

interface IStageEdit extends IStage {
  _id: string;
}

const boardMutations = {
  /**
   * Create new board
   */
  async boardsAdd(_root, doc: IBoard, { user, docModifier }: IContext) {
    await checkPermission(doc.type, user, 'boardsAdd');

    const extendedDoc = docModifier({ userId: user._id, ...doc });

    const board = await Boards.createBoard(extendedDoc);

    await putCreateLog(
      {
        type: `${doc.type}Boards`,
        newData: extendedDoc,
        object: board
      },
      user
    );

    return board;
  },

  /**
   * Edit board
   */
  async boardsEdit(_root, { _id, ...doc }: IBoardsEdit, { user }: IContext) {
    await checkPermission(doc.type, user, 'boardsEdit');

    const board = await Boards.getBoard(_id);
    const updated = await Boards.updateBoard(_id, doc);

    await putUpdateLog(
      {
        type: `${doc.type}Boards`,
        newData: doc,
        object: board,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Remove board
   */
  async boardsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const board = await Boards.getBoard(_id);

    await checkPermission(board.type, user, 'boardsRemove');

    const removed = await Boards.removeBoard(_id);

    await putDeleteLog({ type: `${board.type}Boards`, object: board }, user);

    return removed;
  },

  /**
   * Create new pipeline
   */
  async pipelinesAdd(
    _root,
    { stages, ...doc }: IPipelinesAdd,
    { user }: IContext
  ) {
    await checkPermission(doc.type, user, 'pipelinesAdd');

    const pipeline = await Pipelines.createPipeline(
      { userId: user._id, ...doc },
      stages
    );

    await putCreateLog(
      {
        type: `${doc.type}Pipelines`,
        newData: doc,
        object: pipeline
      },
      user
    );

    return pipeline;
  },

  /**
   * Edit pipeline
   */
  async pipelinesEdit(
    _root,
    { _id, stages, ...doc }: IPipelinesEdit,
    { user }: IContext
  ) {
    await checkPermission(doc.type, user, 'pipelinesEdit');

    const pipeline = await Pipelines.getPipeline(_id);

    const updated = await Pipelines.updatePipeline(_id, doc, stages);

    await putUpdateLog(
      {
        type: `${doc.type}Pipelines`,
        newData: doc,
        object: pipeline,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Update pipeline orders
   */
  async pipelinesUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Pipelines.updateOrder(orders);
  },

  /**
   * Watch pipeline
   */
  async pipelinesWatch(
    _root,
    { _id, isAdd, type }: { _id: string; isAdd: boolean; type: string },
    { user }: IContext
  ) {
    await checkPermission(type, user, 'pipelinesWatch');

    return Pipelines.watchPipeline(_id, isAdd, user._id);
  },

  /**
   * Remove pipeline
   */
  async pipelinesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const pipeline = await Pipelines.getPipeline(_id);

    await checkPermission(pipeline.type, user, 'pipelinesRemove');

    const removed = await Pipelines.removePipeline(_id);

    await putDeleteLog(
      { type: `${pipeline.type}Pipelines`, object: pipeline },
      user
    );

    return removed;
  },

  /**
   * Update stage orders
   */
  stagesUpdateOrder(_root, { orders }: { orders: IOrderInput[] }) {
    return Stages.updateOrder(orders);
  },

  /**
   * Edit stage
   */
  async stagesEdit(_root, { _id, ...doc }: IStageEdit, { user }: IContext) {
    await checkPermission(doc.type, user, 'stagesEdit');

    return Stages.updateStage(_id, doc);
  },

  /**
   * Remove stage
   */
  async stagesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const stage = await Stages.getStage(_id);
    await checkPermission(stage.type, user, 'stagesRemove');

    return Stages.removeStage(_id);
  }
};

export default boardMutations;
