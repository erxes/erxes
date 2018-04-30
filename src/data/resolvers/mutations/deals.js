import { DealBoards, DealPipelines, DealStages, Deals, ActivityLogs } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const dealMutations = {
  /**
   * Create new board
   * @param {String} doc.name
   * @return {Promise} newly created board object
   */
  dealBoardsAdd(root, doc, { user }) {
    return DealBoards.createBoard({ userId: user._id, ...doc });
  },

  /**
   * Edit board
   * @param {String} _id board id
   * @param {String} doc.name
   * @return {Promise} updated board object
   */
  dealBoardsEdit(root, { _id, ...doc }) {
    return DealBoards.updateBoard(_id, doc);
  },

  /**
   * Remove board
   * @param {String} _id
   * @return {Promise}
   */
  dealBoardsRemove(root, { _id }) {
    return DealBoards.removeBoard(_id);
  },

  /**
   * Set default board
   * @param {String} _id
   * @return {Promise}
   */
  dealBoardsSetDefault(root, { _id }) {
    return DealBoards.setDefaultBoard(_id);
  },

  /**
   * Create new pipeline
   * @param {String} doc.name
   * @param {String} doc.boardId
   * @param {[Object]} doc.stages
   * @return {Promise} newly created pipeline object
   */
  dealPipelinesAdd(root, { stages, ...doc }, { user }) {
    return DealPipelines.createPipeline({ userId: user._id, ...doc }, stages);
  },

  /**
   * Edit pipeline
   * @param {String} _id pipeline id
   * @param {String} doc.name
   * @param {String} doc.boardId
   * @param {[Object]} doc.stages
   * @return {Promise} updated pipeline object
   */
  dealPipelinesEdit(root, { _id, stages, ...doc }) {
    return DealPipelines.updatePipeline(_id, doc, stages);
  },

  /**
   * Update pipeline orders
   * @param [OrderItem] [{ _id: [pipeline id], order: [order value] }]
   * @return {Promise} updated pipelines
   */
  dealPipelinesUpdateOrder(root, { orders }) {
    return DealPipelines.updateOrder(orders);
  },

  /**
   * Remove pipeline
   * @param {String} _id
   * @return {Promise}
   */
  dealPipelinesRemove(root, { _id }) {
    return DealPipelines.removePipeline(_id);
  },

  /**
   * Create new stage
   * @param {String} doc.name
   * @param {String} doc.pipelineId
   * @return {Promise} newly created stage object
   */
  dealStagesAdd(root, doc, { user }) {
    return DealStages.createStage({ userId: user._id, ...doc });
  },

  /**
   * Edit stage
   * @param {String} _id stage id
   * @param {String} doc.name
   * @param {String} doc.pipelineId
   * @return {Promise} updated stage object
   */
  dealStagesEdit(root, { _id, ...doc }) {
    return DealStages.updateStage(_id, doc);
  },

  /**
   * Change stage
   * @param {String} _id stage id
   * @param {String} doc.pipelineId
   * @return {Promise} updated stage object
   */
  dealStagesChange(root, { _id, pipelineId }) {
    return DealStages.changeStage(_id, pipelineId);
  },

  /**
   * Update stage orders
   * @param [OrderItem] [{ _id: [stage id], order: [order value] }]
   * @return {Promise} updated stages
   */
  dealStagesUpdateOrder(root, { orders }) {
    return DealStages.updateOrder(orders);
  },

  /**
   * Remove stage
   * @param {String} _id
   * @return {Promise}
   */
  dealStagesRemove(root, { _id }) {
    return DealStages.removeStage(_id);
  },

  /**
   * Create new deal
   * @param {[Object]} doc.productsData
   * @param {[String]} doc.companyIds
   * @param {[String]} doc.customerIds
   * @param {Date} doc.closeDate
   * @param {String} doc.note
   * @param {[String]} doc.assignedUserIds
   * @param {String} doc.stageId
   * @return {Promise} newly created deal object
   */
  async dealsAdd(root, doc, { user }) {
    const deal = await Deals.createDeal({ userId: user._id, ...doc });

    await ActivityLogs.createDealRegistrationLog(deal, user);

    return deal;
  },

  /**
   * Edit deal
   * @param {String} _id deal id
   * @param {[Object]} doc.productsData
   * @param {[String]} doc.companyIds
   * @param {[String]} doc.customerIds
   * @param {Date} doc.closeDate
   * @param {String} doc.note
   * @param {[String]} doc.assignedUserIds
   * @param {String} doc.stageId
   * @return {Promise} updated deal object
   */
  dealsEdit(root, { _id, ...doc }) {
    return Deals.updateDeal(_id, doc);
  },

  /**
   * Change deal
   * @param {String} _id deal id
   * @param {String} doc.stageId
   * @return {Promise} updated deal object
   */
  dealsChange(root, { _id, ...doc }) {
    return Deals.updateDeal(_id, doc);
  },

  /**
   * Update deal orders
   * @param [OrderItem] [{ _id: [deal id], order: [order value] }]
   * @return {Promise} updated deals
   */
  dealsUpdateOrder(root, { orders }) {
    return Deals.updateOrder(orders);
  },

  /**
   * Remove deal
   * @param {String} _id
   * @return {Promise}
   */
  dealsRemove(root, { _id }) {
    return Deals.removeDeal(_id);
  },
};

moduleRequireLogin(dealMutations);

export default dealMutations;
