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
  const prevDealIds = stages.map(stage => stage._id);
  // fetch stage from database
  const prevEntries = await DealStages.find({ _id: { $in: prevDealIds } });
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
      const createdStage = await DealStages.createStage(doc);
      validStageIds.push(createdStage._id);
    }
  }
  if (bulkOpsPrevEntry.length > 0) {
    await DealStages.bulkWrite(bulkOpsPrevEntry);
  }

  return DealStages.deleteMany({ pipelineId, _id: { $nin: validStageIds } });
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
    await DealBoards.updateOne({ _id }, { $set: doc });

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

    const count = await DealPipelines.find({ boardId: _id }).countDocuments();

    if (count > 0) {
      throw new Error("Can't remove a board");
    }

    return DealBoards.deleteOne({ _id });
  }
}

interface IPipelineModel extends Model<IPipelineDocument> {
  createPipeline(doc: IPipeline, stages: IPipelineStage[]): Promise<IPipelineDocument>;
  updatePipeline(_id: string, doc: IPipeline, stages: IPipelineStage[]): Promise<IPipelineDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IPipelineDocument[]>;
  removePipeline(_id: string): void;
}

class Pipeline {
  /**
   * Create a pipeline
   */
  public static async createPipeline(doc: IPipeline, stages: IPipelineStage[]) {
    const pipeline = await DealPipelines.create(doc);

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

    await DealPipelines.updateOne({ _id }, { $set: doc });

    return DealPipelines.findOne({ _id });
  }

  /*
   * Update given pipelines orders
   */
  public static async updateOrder(orders: IOrderInput[]) {
    const ids: string[] = [];

    const bulkOps: Array<{
      updateOne: { filter: { _id: string }; update: { order: number } };
    }> = [];

    for (const { _id, order } of orders) {
      ids.push(_id);

      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { order },
        },
      });
    }
    if (bulkOps) {
      await DealPipelines.bulkWrite(bulkOps);
    }

    return DealPipelines.find({ _id: { $in: ids } }).sort({ order: 1 });
  }

  /**
   * Remove Pipeline
   */
  public static async removePipeline(_id: string) {
    const pipeline = await DealPipelines.findOne({ _id });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    const count = await DealStages.find({ pipelineId: _id }).countDocuments();

    if (count > 0) {
      throw new Error("Can't remove a pipeline");
    }

    return DealPipelines.deleteOne({ _id });
  }
}

interface IStageModel extends Model<IStageDocument> {
  createStage(doc: IStage): Promise<IStageDocument>;
  updateStage(_id: string, doc: IStage): Promise<IStageDocument>;
  changeStage(_id: string, pipelineId: string): Promise<IStageDocument>;
  updateOrder(orders: IOrderInput[]): Promise<IStageDocument[]>;
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
    await DealStages.updateOne({ _id }, { $set: doc });

    return DealStages.findOne({ _id });
  }

  /**
   * Change Stage
   */
  public static async changeStage(_id: string, pipelineId: string) {
    await DealStages.updateOne({ _id }, { $set: { pipelineId } });
    await Deals.updateMany({ stageId: _id }, { $set: { pipelineId } });

    return DealStages.findOne({ _id });
  }

  /*
   * Update given stages orders
   */
  public static async updateOrder(orders: IOrderInput[]) {
    const ids: string[] = [];
    const bulkOps: Array<{
      updateOne: { filter: { _id: string }; update: { order: number } };
    }> = [];
    for (const { _id, order } of orders) {
      ids.push(_id);
      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { order },
        },
      });
    }
    if (bulkOps) {
      await DealStages.bulkWrite(bulkOps);
    }

    return DealStages.find({ _id: { $in: ids } }).sort({ order: 1 });
  }

  /**
   * Remove Stage
   */
  public static async removeStage(_id: string) {
    const stage = await DealStages.findOne({ _id });

    if (!stage) {
      throw new Error('Stage not found');
    }

    const count = await Deals.find({ stageId: _id }).countDocuments();

    if (count > 0) {
      throw new Error("Can't remove a stage");
    }

    return DealStages.deleteOne({ _id });
  }
}

interface IDealModel extends Model<IDealDocument> {
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  updateOrder(stageId: string, orders: IOrderInput[]): Promise<IDealDocument[]>;
  removeDeal(_id: string): void;
  changeCustomer(newCustomerId: string, oldCustomerIds: string[]): Promise<IDealDocument>;
  changeCompany(newCompanyId: string, oldCompanyIds: string[]): Promise<IDealDocument>;
}

class Deal {
  /**
   * Create a deal
   */
  public static async createDeal(doc: IDeal) {
    const dealsCount = await Deals.find({
      stageId: doc.stageId,
    }).countDocuments();

    return Deals.create({
      ...doc,
      order: dealsCount,
      modifiedAt: new Date(),
    });
  }

  /**
   * Update Deal
   */
  public static async updateDeal(_id: string, doc: IDeal) {
    await Deals.updateOne({ _id }, { $set: doc });

    return Deals.findOne({ _id });
  }

  /*
   * Update given deals orders
   */
  public static async updateOrder(stageId: string, orders: IOrderInput[]) {
    const ids: string[] = [];
    const bulkOps: Array<{
      updateOne: {
        filter: { _id: string };
        update: { stageId: string; order: number };
      };
    }> = [];

    for (const { _id, order } of orders) {
      ids.push(_id);
      bulkOps.push({
        updateOne: {
          filter: { _id },
          update: { stageId, order },
        },
      });

      // update each deals order
    }

    if (bulkOps) {
      await Deals.bulkWrite(bulkOps);
    }

    return Deals.find({ _id: { $in: ids } }).sort({ order: 1 });
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

  /**
   * Change customer
   */
  public static async changeCustomer(newCustomerId: string, oldCustomerIds: string[]) {
    if (oldCustomerIds) {
      await Deals.updateMany({ customerIds: { $in: oldCustomerIds } }, { $addToSet: { customerIds: newCustomerId } });
      await Deals.updateMany({ customerIds: { $in: oldCustomerIds } }, { $pullAll: { customerIds: oldCustomerIds } });
    }

    return Deals.find({ customerIds: { $in: oldCustomerIds } });
  }

  /**
   * Change company
   */
  public static async changeCompany(newCompanyId: string, oldCompanyIds: string[]) {
    if (oldCompanyIds) {
      await Deals.updateMany({ companyIds: { $in: oldCompanyIds } }, { $addToSet: { companyIds: newCompanyId } });

      await Deals.updateMany({ companyIds: { $in: oldCompanyIds } }, { $pullAll: { companyIds: oldCompanyIds } });
    }

    return Deals.find({ customerIds: { $in: oldCompanyIds } });
  }
}

boardSchema.loadClass(Board);
pipelineSchema.loadClass(Pipeline);
stageSchema.loadClass(Stage);
dealSchema.loadClass(Deal);

// tslint:disable-next-line
const DealBoards = model<IBoardDocument, IBoardModel>('deal_boards', boardSchema);

// tslint:disable-next-line
const DealPipelines = model<IPipelineDocument, IPipelineModel>('deal_pipelines', pipelineSchema);

// tslint:disable-next-line
const DealStages = model<IStageDocument, IStageModel>('deal_stages', stageSchema);

// tslint:disable-next-line
const Deals = model<IDealDocument, IDealModel>('deals', dealSchema);

export { DealBoards, DealPipelines, DealStages, Deals };
