import mongoose from 'mongoose';
import { field } from './utils';

// Schema for common fields
const commonFields = {
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
  order: field({ type: Number }),
};

// Deal board schema
const DealBoardSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  ...commonFields,
});

class Board {
  /**
   * Create a board
   * @param  {Object} doc
   * @return {Promise} Newly created board object
   */
  static async createBoard(doc) {
    return this.create(doc);
  }

  /**
   * Update Board
   * @param  {Object} doc
   * @return {Promise} updated board object
   */
  static async updateBoard(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Board
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeBoard(ids) {
    const boardCount = await DealBoards.find({ _id: { $in: ids } }).count();

    if (boardCount !== ids.length) throw new Error('Board not found');

    return DealBoards.remove({ _id: { $in: ids } });
  }
}

const createPipelineStages = async (stages, pipelineId) => {
  await DealStages.remove({ pipelineId });

  for (let stage of stages) {
    DealStages.create(stage);
  }
};

// Deal pipeline schema
const DealPipelineSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  boardId: field({ type: String }),
  ...commonFields,
});

class Pipeline {
  /**
   * Create a pipeline
   * @param  {Object} doc
   * @return {Promise} Newly created pipeline object
   */
  static async createPipeline(doc, stages) {
    const pipeline = await this.create(doc);

    if (stages) {
      createPipelineStages(stages, pipeline._id);
    }

    return pipeline;
  }

  /**
   * Update Pipeline
   * @param  {Object} doc
   * @return {Promise} updated pipeline object
   */
  static async updatePipeline(_id, doc, stages) {
    if (stages) {
      createPipelineStages(stages, _id);
    }

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Pipeline
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removePipeline(ids) {
    const pipelineCount = await DealPipelines.find({ _id: { $in: ids } }).count();

    if (pipelineCount !== ids.length) throw new Error('Pipeline not found');

    return DealPipelines.remove({ _id: { $in: ids } });
  }
}

// Deal pipeline stage schema
const DealStageSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  boardId: field({ type: String }),
  pipelineId: field({ type: String }),
  ...commonFields,
});

class Stage {
  /**
   * Create a stage
   * @param  {Object} doc
   * @return {Promise} Newly created stage object
   */
  static async createStage(doc) {
    return this.create(doc);
  }

  /**
   * Update Stage
   * @param  {Object} doc
   * @return {Promise} updated stage object
   */
  static async updateStage(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Stage
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeStage(ids) {
    const stageCount = await DealStages.find({ _id: { $in: ids } }).count();

    if (stageCount !== ids.length) throw new Error('Stage not found');

    return DealStages.remove({ _id: { $in: ids } });
  }
}

// Deal schema
const DealSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  productIds: field({ type: [String] }),
  companyId: field({ type: String }),
  amount: field({ type: Number }),
  closeDate: field({ type: Date }),
  note: field({ type: String }),
  assignedUserIds: field({ type: [String] }),
  boardId: field({ type: String }),
  pipelineId: field({ type: String }),
  stageId: field({ type: String }),
  ...commonFields,
});

class Deal {
  /**
   * Create a deal
   * @param  {Object} doc
   * @return {Promise} Newly created deal object
   */
  static async createDeal(doc) {
    return this.create(doc);
  }

  /**
   * Update Deal
   * @param  {Object} doc
   * @return {Promise} updated deal object
   */
  static async updateDeal(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove Deal
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeDeal(ids) {
    const dealCount = await Deals.find({ _id: { $in: ids } }).count();

    if (dealCount !== ids.length) throw new Error('Deal not found');

    return Deals.remove({ _id: { $in: ids } });
  }
}

DealBoardSchema.loadClass(Board);

const DealBoards = mongoose.model('deal_boards', DealBoardSchema);

DealPipelineSchema.loadClass(Pipeline);

const DealPipelines = mongoose.model('deal_pipelines', DealPipelineSchema);

DealStageSchema.loadClass(Stage);

const DealStages = mongoose.model('deal_stages', DealStageSchema);

DealSchema.loadClass(Deal);

const Deals = mongoose.model('deals', DealSchema);

export { DealBoards, DealPipelines, DealStages, Deals };
