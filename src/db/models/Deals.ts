import { Model, model } from 'mongoose';
import {
  boardSchema,
  dealSchema,
  IBoard,
  IBoardDocument,
  IDeal,
  IDealDocument,
  IPipeline,
  IPipelineDocument,
  IStage,
  IStageDocument,
  pipelineSchema,
  stageSchema,
} from './definitions/deals';

export interface IOrderInput {
  _id: string;
  order: number;
}

const updateListOrder = async (collection: any, orders: IOrderInput[]) => {
  const ids: string[] = [];

  for (const { _id, order } of orders) {
    ids.push(_id);

    // update each deals order
    await collection.update({ _id }, { order });
  }

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

const createOrUpdatePipelineStages = async (stages: IStageDocument[], pipelineId: string) => {
  let order = 0;

  for (const stage of stages) {
    order++;

    const doc = { ...stage.toJSON(), order, pipelineId };

    const _id = doc._id;
    const obj = await DealStages.findOne({ _id });

    // edit
    if (obj) {
      await DealStages.update({ _id }, { $set: doc });
    } else {
      await DealStages.create(doc);
    }
  }

  const removedStages = await DealStages.find({
    pipelineId,
    _id: { $nin: stages.map(s => s._id) },
  });

  for (const stage of removedStages) {
    await DealStages.removeStage(stage._id);
  }
};

interface IBoardModel extends Model<IBoardDocument> {
  createBoard(doc: IBoard): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard): Promise<IBoardDocument>;
  removeBoard(_id: string): void;
}

class Board {
  /**
   * Create a board
   */
  public static async createBoard(doc: IBoard) {
    return DealBoards.create(doc);
  }

  /**
   * Update Board
   */
  public static async updateBoard(_id: string, doc: IBoard) {
    await DealBoards.update({ _id }, { $set: doc });

    return DealBoards.findOne({ _id });
  }

  /**
   * Remove Board
   */
  public static async removeBoard(_id: string) {
    const board = await DealBoards.findOne({ _id });

    if (!board) {
      throw new Error('Board not found');
    }

    const count = await DealPipelines.find({ boardId: _id }).count();

    if (count > 0) {
      throw new Error("Can't remove a board");
    }

    return DealBoards.remove({ _id });
  }
}

interface IPipelineModel extends Model<IPipelineDocument> {
  createPipeline(doc: IPipeline, stages: IStageDocument[]): Promise<IPipelineDocument>;

  updatePipeline(_id: string, doc: IPipeline, stages: IStageDocument[]): Promise<IPipelineDocument>;

  updateOrder(orders: IOrderInput[]): any[];
  removePipeline(_id: string): void;
}

class Pipeline {
  /**
   * Create a pipeline
   */
  public static async createPipeline(doc: IPipeline, stages: IStageDocument[]) {
    const pipeline = await DealPipelines.create(doc);

    if (stages) {
      await createOrUpdatePipelineStages(stages, pipeline._id);
    }

    return pipeline;
  }

  /**
   * Update Pipeline
   */
  public static async updatePipeline(_id: string, doc: IPipeline, stages: IStageDocument[]) {
    if (stages) {
      await createOrUpdatePipelineStages(stages, _id);
    }

    await DealPipelines.update({ _id }, { $set: doc });

    return DealPipelines.findOne({ _id });
  }

  /*
   * Update given pipelines orders
   */
  public static updateOrder(orders: IOrderInput[]) {
    return updateListOrder(this, orders);
  }

  /**
   * Remove Pipeline
   */
  public static async removePipeline(_id: string) {
    const pipeline = await DealPipelines.findOne({ _id });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    const count = await DealStages.find({ pipelineId: _id }).count();

    if (count > 0) {
      throw new Error("Can't remove a pipeline");
    }

    return DealPipelines.remove({ _id });
  }
}

interface IStageModel extends Model<IStageDocument> {
  createStage(doc: IStage): Promise<IStageDocument>;
  updateStage(_id: string, doc: IStage): Promise<IStageDocument>;
  changeStage(_id: string, pipelineId: string): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): any[];
  removeStage(_id: string): void;
}

class Stage {
  /**
   * Create a stage
   */
  public static createStage(doc: IStage) {
    return DealStages.create(doc);
  }

  /**
   * Update Stage
   */
  public static async updateStage(_id: string, doc: IStage) {
    await DealStages.update({ _id }, { $set: doc });

    return DealStages.findOne({ _id });
  }

  /**
   * Change Stage
   */
  public static async changeStage(_id: string, pipelineId: string) {
    await DealStages.update({ _id }, { $set: { pipelineId } });
    await Deals.updateMany({ stageId: _id }, { $set: { pipelineId } });

    return DealStages.findOne({ _id });
  }

  /*
   * Update given stages orders
   */
  public static updateOrder(orders: IOrderInput[]) {
    return updateListOrder(this, orders);
  }

  /**
   * Remove Stage
   */
  public static async removeStage(_id: string) {
    const stage = await DealStages.findOne({ _id });

    if (!stage) {
      throw new Error('Stage not found');
    }

    const count = await Deals.find({ stageId: _id }).count();

    if (count > 0) {
      throw new Error("Can't remove a stage");
    }

    return DealStages.remove({ _id });
  }
}

interface IDealModel extends Model<IDealDocument> {
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  updateOrder(orders: IOrderInput[]): any[];
  removeDeal(_id: string): void;
}

class Deal {
  /**
   * Create a deal
   */
  public static async createDeal(doc: IDeal) {
    return Deals.create(doc);
  }

  /**
   * Update Deal
   */
  public static async updateDeal(_id: string, doc: IDeal) {
    await Deals.update({ _id }, { $set: doc });

    return Deals.findOne({ _id });
  }

  /*
   * Update given deals orders
   */
  public static updateOrder(orders: IOrderInput[]) {
    return updateListOrder(this, orders);
  }

  /**
   * Remove Deal
   */
  public static async removeDeal(_id: string) {
    const deal = await Deals.findOne({ _id });

    if (!deal) {
      throw new Error('Deal not found');
    }

    return deal.remove();
  }
}

boardSchema.loadClass(Board);
pipelineSchema.loadClass(Pipeline);
stageSchema.loadClass(Stage);
dealSchema.loadClass(Deal);

const DealBoards = model<IBoardDocument, IBoardModel>('deal_boards', boardSchema);

const DealPipelines = model<IPipelineDocument, IPipelineModel>('deal_pipelines', pipelineSchema);

const DealStages = model<IStageDocument, IStageModel>('deal_stages', stageSchema);

const Deals = model<IDealDocument, IDealModel>('deals', dealSchema);

export { DealBoards, DealPipelines, DealStages, Deals };
