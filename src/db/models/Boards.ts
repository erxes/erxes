import { Model, model } from 'mongoose';
import { Deals, Tasks, Tickets } from './';
import { updateOrder, watchItem } from './boardUtils';
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

export interface IOrderInput {
  _id: string;
  order: number;
}

// Not mongoose document, just stage shaped plain object
type IPipelineStage = IStage & { _id: string };

const createOrUpdatePipelineStages = async (stages: IPipelineStage[], pipelineId: string, type: string) => {
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

  const ITEMS = {
    deal: Deals,
    ticket: Tickets,
    task: Tasks,
  };

  const remainedStages = await Stages.find({ pipelineId, _id: { $nin: prevItemIds } });

  for (const stage of remainedStages) {
    const itemCount = await ITEMS[type].find({ stageId: stage._id }).countDocuments();

    if (itemCount > 0) {
      throw new Error('There is a stage that has a item');
    }
  }

  return Stages.deleteMany({ pipelineId, _id: { $nin: validStageIds } });
};

export interface IBoardModel extends Model<IBoardDocument> {
  getBoard(_id: string): Promise<IBoardDocument>;
  createBoard(doc: IBoard): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard): Promise<IBoardDocument>;
  removeBoard(_id: string): void;
}

export const loadBoardClass = () => {
  class Board {
    /*
     * Get a Board
     */
    public static async getBoard(_id: string) {
      const board = await Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      return board;
    }

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
  getPipeline(_id: string): Promise<IPipelineDocument>;
  createPipeline(doc: IPipeline, stages: IPipelineStage[]): Promise<IPipelineDocument>;
  updatePipeline(_id: string, doc: IPipeline, stages: IPipelineStage[]): Promise<IPipelineDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IPipelineDocument[]>;
  watchPipeline(_id: string, isAdd: boolean, userId: string): void;
  removePipeline(_id: string): void;
}

export const loadPipelineClass = () => {
  class Pipeline {
    /*
     * Get a pipeline
     */
    public static async getPipeline(_id: string) {
      const pipeline = await Pipelines.findOne({ _id });

      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      return pipeline;
    }

    /**
     * Create a pipeline
     */
    public static async createPipeline(doc: IPipeline, stages: IPipelineStage[]) {
      const pipeline = await Pipelines.create(doc);

      if (stages) {
        await createOrUpdatePipelineStages(stages, pipeline._id, pipeline.type);
      }

      return pipeline;
    }

    /**
     * Update Pipeline
     */
    public static async updatePipeline(_id: string, doc: IPipeline, stages: IPipelineStage[]) {
      if (stages) {
        await createOrUpdatePipelineStages(stages, _id, doc.type);
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

    public static async watchPipeline(_id: string, isAdd: boolean, userId: string) {
      return watchItem(Pipelines, _id, isAdd, userId);
    }
  }

  pipelineSchema.loadClass(Pipeline);

  return pipelineSchema;
};

export interface IStageModel extends Model<IStageDocument> {
  getStage(_id: string): Promise<IStageDocument>;
  createStage(doc: IStage): Promise<IStageDocument>;
  updateStage(_id: string, doc: IStage): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IStageDocument[]>;
}

export const loadStageClass = () => {
  class Stage {
    /*
     * Get a stage
     */
    public static async getStage(_id: string) {
      const stage = await Stages.findOne({ _id });

      if (!stage) {
        throw new Error('Stage not found');
      }

      return stage;
    }

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

    /*
     * Update given stages orders
     */
    public static async updateOrder(orders: IOrderInput[]) {
      return updateOrder(Stages, orders);
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
