import { Model, model } from 'mongoose';
import { Deals, Tasks, Tickets } from './';
import {
  boardSchema,
  IBoard,
  IBoardDocument,
  IPipeline,
  IPipelineDocument,
  IStage,
  IStageDocument,
  pipelineSchema,
  stageSchema,
} from './definitions/boards';
import { BOARD_TYPES } from './definitions/constants';
import { updateOrder } from './utils';

export interface IOrderInput {
  _id: string;
  order: number;
}

// Not mongoose document, just stage shaped plain object
type IPipelineStage = IStage & { _id: string };

const createOrUpdatePipelineStages = async (stages: IPipelineStage[], pipelineId: string) => {
  let order = 0;

  const validStageIds: string[] = [];
  const bulkOpsPrevEntry: Array<{
    updateOne: {
      filter: { _id: string };
      update: { $set: IStage };
    };
  }> = [];
  const prevItemIds = stages.map(stage => stage._id);
  // fetch stage from database
  const prevEntries = await Stages.find({ _id: { $in: prevItemIds } });
  const prevEntriesIds = prevEntries.map(entry => entry._id);

  for (const stage of stages) {
    order++;

    const doc = { ...stage, order, pipelineId };

    const _id = doc._id;

    const prevEntry = prevEntriesIds.includes(_id);

    // edit
    if (prevEntry) {
      validStageIds.push(_id);

      bulkOpsPrevEntry.push({
        updateOne: {
          filter: {
            _id,
          },
          update: {
            $set: doc,
          },
        },
      });
      // create
    } else {
      delete doc._id;
      const createdStage = await Stages.createStage(doc);
      validStageIds.push(createdStage._id);
    }
  }
  if (bulkOpsPrevEntry.length > 0) {
    await Stages.bulkWrite(bulkOpsPrevEntry);
  }

  return Stages.deleteMany({ pipelineId, _id: { $nin: validStageIds } });
};

export interface IBoardModel extends Model<IBoardDocument> {
  createBoard(doc: IBoard): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard): Promise<IBoardDocument>;
  removeBoard(_id: string): void;
}

export const loadBoardClass = () => {
  class Board {
    /**
     * Create a board
     */
    public static async createBoard(doc: IBoard) {
      return Boards.create(doc);
    }

    /**
     * Update Board
     */
    public static async updateBoard(_id: string, doc: IBoard) {
      await Boards.updateOne({ _id }, { $set: doc });

      return Boards.findOne({ _id });
    }

    /**
     * Remove Board
     */
    public static async removeBoard(_id: string) {
      const board = await Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      const count = await Pipelines.find({ boardId: _id }).countDocuments();

      if (count > 0) {
        throw new Error("Can't remove a board");
      }

      return Boards.deleteOne({ _id });
    }
  }

  boardSchema.loadClass(Board);

  return boardSchema;
};

export interface IPipelineModel extends Model<IPipelineDocument> {
  createPipeline(doc: IPipeline, stages: IPipelineStage[]): Promise<IPipelineDocument>;
  updatePipeline(_id: string, doc: IPipeline, stages: IPipelineStage[]): Promise<IPipelineDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IPipelineDocument[]>;
  removePipeline(_id: string): void;
}

export const loadPipelineClass = () => {
  class Pipeline {
    /**
     * Create a pipeline
     */
    public static async createPipeline(doc: IPipeline, stages: IPipelineStage[]) {
      const pipeline = await Pipelines.create(doc);

      if (stages) {
        await createOrUpdatePipelineStages(stages, pipeline._id);
      }

      return pipeline;
    }

    /**
     * Update Pipeline
     */
    public static async updatePipeline(_id: string, doc: IPipeline, stages: IPipelineStage[]) {
      if (stages) {
        await createOrUpdatePipelineStages(stages, _id);
      }

      await Pipelines.updateOne({ _id }, { $set: doc });

      return Pipelines.findOne({ _id });
    }

    /*
     * Update given pipelines orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(Pipelines, orders);
    }

    /**
     * Remove Pipeline
     */
    public static async removePipeline(_id: string) {
      const pipeline = await Pipelines.findOne({ _id });

      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      const count = await Stages.find({ pipelineId: _id }).countDocuments();

      if (count > 0) {
        throw new Error("Can't remove a pipeline");
      }

      return Pipelines.deleteOne({ _id });
    }
  }

  pipelineSchema.loadClass(Pipeline);

  return pipelineSchema;
};

export interface IStageModel extends Model<IStageDocument> {
  createStage(doc: IStage): Promise<IStageDocument>;
  updateStage(_id: string, doc: IStage): Promise<IStageDocument>;
  changeStage(_id: string, pipelineId: string): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IStageDocument[]>;
  removeStage(_id: string): void;
}

export const loadStageClass = () => {
  class Stage {
    /**
     * Create a stage
     */
    public static createStage(doc: IStage) {
      return Stages.create(doc);
    }

    /**
     * Update Stage
     */
    public static async updateStage(_id: string, doc: IStage) {
      await Stages.updateOne({ _id }, { $set: doc });

      return Stages.findOne({ _id });
    }

    /**
     * Change Stage
     */
    public static async changeStage(_id: string, pipelineId: string) {
      const stage = await Stages.updateOne({ _id }, { $set: { pipelineId } });

      switch (stage.type) {
        case BOARD_TYPES.DEAL: {
          await Deals.updateMany({ stageId: _id }, { $set: { pipelineId } });

          break;
        }
        case BOARD_TYPES.TICKET: {
          await Tickets.updateMany({ stageId: _id }, { $set: { pipelineId } });

          break;
        }
        case BOARD_TYPES.TASK: {
          await Tasks.updateMany({ stageId: _id }, { $set: { pipelineId } });

          break;
        }
      }

      return Stages.findOne({ _id });
    }

    /*
     * Update given stages orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(Stages, orders);
    }

    /**
     * Remove Stage
     */
    public static async removeStage(_id: string) {
      const stage = await Stages.findOne({ _id });

      if (!stage) {
        throw new Error('Stage not found');
      }

      let count;

      switch (stage.type) {
        case BOARD_TYPES.DEAL: {
          count = await Deals.find({ stageId: _id }).countDocuments();

          break;
        }
        case BOARD_TYPES.TICKET: {
          count = await Tickets.find({ stageId: _id }).countDocuments();

          break;
        }
        case BOARD_TYPES.TASK: {
          count = await Tasks.find({ stageId: _id }).countDocuments();

          break;
        }
      }

      if (count > 0) {
        throw new Error("Can't remove a stage");
      }

      return Stages.deleteOne({ _id });
    }
  }

  stageSchema.loadClass(Stage);

  return stageSchema;
};

loadBoardClass();
loadPipelineClass();
loadStageClass();

// tslint:disable-next-line
const Boards = model<IBoardDocument, IBoardModel>('boards', boardSchema);

// tslint:disable-next-line
const Pipelines = model<IPipelineDocument, IPipelineModel>('pipelines', pipelineSchema);

// tslint:disable-next-line
const Stages = model<IStageDocument, IStageModel>('stages', stageSchema);

export { Boards, Pipelines, Stages };
