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
 * Create pipelines with stages
 *
 * @param {[Stage]} stages
 * @param  {String} pipelineId
 */
const createOrUpdatePipelineStages = async (stages, pipelineId) => {
  let order = 0;
  const stageIds = [];

  for (let stage of stages) {
    if (stage.name) {
      order += 1;

      const doc = stage.order ? { pipelineId, ...stage } : { order, pipelineId, ...stage };

      if (doc._id) {
        const _id = doc._id;
        const stage = await DealStages.findOne({ _id });
        delete doc._id;

        if (stage) {
          await DealStages.update({ _id }, { $set: doc });
          stageIds.push(stage._id);
        }
      } else {
        const stage = await DealStages.create(doc);
        stageIds.push(stage._id);
      }
    }
  }

  const removeStageIds = await DealStages.find({ pipelineId, _id: { $nin: stageIds } }).select(
    '_id',
  );

  for (let selector of removeStageIds) {
    DealStages.removeStage(selector._id);
  }
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
  static async removeBoard(_id) {
    const board = await DealBoards.findOne({ _id });

    if (!board) throw new Error('Board not found');

    let count = 0;
    count += await DealPipelines.find({ boardId: _id }).count();
    count += await DealStages.find({ boardId: _id }).count();
    count += await Deals.find({ boardId: _id }).count();

    if (count > 0) throw new Error("Can't remove a board");

    return DealBoards.remove({ _id });
  }
}

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
      createOrUpdatePipelineStages(stages, pipeline._id);
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
      createOrUpdatePipelineStages(stages, _id);
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
  static async updateOrder(orders) {
    return await updateListOrder(this, orders);
  }

  /**
   * Remove Pipeline
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removePipeline(_id) {
    const pipeline = await DealPipelines.findOne({ _id });

    if (!pipeline) throw new Error('Pipeline not found');

    let count = 0;
    count += await DealStages.find({ pipelineId: _id }).count();
    count += await Deals.find({ pipelineId: _id }).count();

    if (count > 0) throw new Error("Can't remove a pipeline");

    return DealPipelines.remove({ _id });
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
  static async updateOrder(orders) {
    return await updateListOrder(this, orders);
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
const productSchema = mongoose.Schema(
  {
    productId: String,
    uom: String,
    currency: String,
    quantity: Number,
    unitPrice: Number,
    taxPercent: Number,
    tax: Number,
    amount: Number,
  },
  { _id: false },
);

// Deal schema
const DealSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  productIds: field({ type: [String] }),
  productsData: field({ type: [productSchema] }),
  companyId: field({ type: String }),
  customerId: field({ type: String }),
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
  static async updateOrder(orders) {
    return await updateListOrder(this, orders);
  }

  /**
   * Remove Deal
   * @param  {[String]} ids
   * @return {Promise}
   */
  static async removeDeal(_id) {
    const deal = await Deals.findOne({ _id });

    if (!deal) throw new Error('Deal not found');

    return Deals.remove({ _id });
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
