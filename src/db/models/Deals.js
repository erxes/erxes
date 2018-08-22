import mongoose from 'mongoose';
import { field } from './utils';
import { PROBABILITY } from '../../data/constants';

// Schema for common fields
const commonFields = {
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
  order: field({ type: Number }),
};

/*
 * Update given collections orders
 *
 * @param [OrderItem] orders
 * [{
 *  _id: {String} item id
 *  order: {Number} order
 * }]
 *
 * @return [Object] updated collections
 */
const updateListOrder = async (collection, orders) => {
  const ids = [];

  for (let { _id, order } of orders) {
    ids.push(_id);

    // update each deals order
    await collection.update({ _id }, { order });
  }

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

/*
 * Create or update pipelines with stages
 *
 * @param {[Stage]} stages
 * @param  {String} pipelineId
 */
const createOrUpdatePipelineStages = async (stages, pipelineId) => {
  let order = 0;

  for (const stage of stages) {
    order++;

    const doc = { order, pipelineId, ...stage };

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
    DealStages.removeStage(stage._id);
  }
};

// Deal board schema
const BoardSchema = mongoose.Schema({
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
  static async removeBoard(_id) {
    const board = await DealBoards.findOne({ _id });

    if (!board) throw new Error('Board not found');

    const count = await DealPipelines.find({ boardId: _id }).count();

    if (count > 0) throw new Error("Can't remove a board");

    return DealBoards.remove({ _id });
  }
}

// Deal pipeline schema
const PipelineSchema = mongoose.Schema({
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
      await createOrUpdatePipelineStages(stages, pipeline._id);
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
      await createOrUpdatePipelineStages(stages, _id);
    }

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Update given pipelines orders
   *
   * @param [OrderItem] orders
   * [{
   *  _id: {String} pipeline id
   *  order: {Number} order
   * }]
   *
   * @return [Pipeline] updated pipelines
   */
  static updateOrder(orders) {
    return updateListOrder(this, orders);
  }

  /**
   * Remove Pipeline
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removePipeline(_id) {
    const pipeline = await DealPipelines.findOne({ _id });

    if (!pipeline) throw new Error('Pipeline not found');

    const count = await DealStages.find({ pipelineId: _id }).count();

    if (count > 0) throw new Error("Can't remove a pipeline");

    return DealPipelines.remove({ _id });
  }
}

// Deal pipeline stage schema
const StageSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  probability: field({
    type: String,
    enum: PROBABILITY.ALL,
  }), // Win probability
  pipelineId: field({ type: String }),
  ...commonFields,
});

class Stage {
  /**
   * Create a stage
   * @param  {Object} doc
   * @return {Promise} Newly created stage object
   */
  static createStage(doc) {
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
   * Change Stage
   * @param  {String} pipelineId
   * @return {Promise} updated stage object
   */
  static async changeStage(_id, pipelineId) {
    await this.update({ _id }, { $set: { pipelineId } });
    await Deals.updateMany({ stageId: _id }, { $set: { pipelineId } });

    return this.findOne({ _id });
  }

  /*
   * Update given stages orders
   *
   * @param [OrderItem] orders
   * [{
   *  _id: {String} stage id
   *  order: {Number} order
   * }]
   *
   * @return [Stage] updated stages
   */
  static updateOrder(orders) {
    return updateListOrder(this, orders);
  }

  /**
   * Remove Stage
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeStage(_id) {
    const stage = await DealStages.findOne({ _id });

    if (!stage) throw new Error('Stage not found');

    const count = await Deals.find({ stageId: _id }).count();

    if (count > 0) throw new Error("Can't remove a stage");

    return DealStages.remove({ _id });
  }
}

/* Deal products schema */
const ProductSchema = mongoose.Schema(
  {
    _id: String,
    productId: String,
    uom: String, // Units of measurement
    currency: String,
    quantity: Number,
    unitPrice: Number,
    taxPercent: Number,
    tax: Number,
    discountPercent: Number,
    discount: Number,
    amount: Number,
  },
  { _id: false },
);

// Deal schema
const DealSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  productsData: field({ type: [ProductSchema] }),
  companyIds: field({ type: [String] }),
  customerIds: field({ type: [String] }),
  closeDate: field({ type: Date }),
  description: field({ type: String, optional: true }),
  assignedUserIds: field({ type: [String] }),
  stageId: field({ type: String }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
  }),
  modifiedBy: field({ type: String }),
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

  /*
   * Update given deals orders
   *
   * @param [OrderItem] orders
   * [{
   *  _id: {String} deal id
   *  order: {Number} order
   * }]
   *
   * @return [Deal] updated deals
   */
  static updateOrder(orders) {
    return updateListOrder(this, orders);
  }

  /**
   * Remove Deal
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeDeal(_id) {
    const deal = await this.findOne({ _id });

    if (!deal) throw new Error('Deal not found');

    return deal.remove();
  }
}

BoardSchema.loadClass(Board);
PipelineSchema.loadClass(Pipeline);
StageSchema.loadClass(Stage);
DealSchema.loadClass(Deal);

const DealBoards = mongoose.model('deal_boards', BoardSchema);
const DealPipelines = mongoose.model('deal_pipelines', PipelineSchema);
const DealStages = mongoose.model('deal_stages', StageSchema);
const Deals = mongoose.model('deals', DealSchema);

export { DealBoards, DealPipelines, DealStages, Deals };
