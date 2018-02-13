import { DealBoards, DealPipelines, DealStages, Deals } from '../../../db/models';
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
  * @param {[String]} ids
  * @return {Promise}
  */
  dealBoardsRemove(root, { ids }) {
    return DealBoards.removeBoard(ids);
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
  * Remove pipeline
  * @param {[String]} ids
  * @return {Promise}
  */
  dealPipelinesRemove(root, { ids }) {
    return DealPipelines.removePipeline(ids);
  },

  /**
  * Create new stage
  * @param {String} doc.name
  * @param {String} doc.boardId
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
  * @param {String} doc.boardId
  * @param {String} doc.pipelineId
  * @return {Promise} updated stage object
  */
  dealStagesEdit(root, { _id, ...doc }) {
    return DealStages.updateStage(_id, doc);
  },

  /**
  * Remove stage
  * @param {[String]} ids
  * @return {Promise}
  */
  dealStagesRemove(root, { ids }) {
    return DealStages.removeStage(ids);
  },

  /**
  * Create new deal
  * @param {[String]} doc.productIds
  * @param {String} doc.companyId
  * @param {Number} doc.amount
  * @param {Date} doc.closeDate
  * @param {String} doc.note
  * @param {[String]} doc.assignedUserIds
  * @param {String} doc.boardId
  * @param {String} doc.pipelineId
  * @param {String} doc.stageId
  * @return {Promise} newly created deal object
  */
  dealsAdd(root, doc, { user }) {
    return Deals.createDeals({ userId: user._id, ...doc });
  },

  /**
  * Edit deal
  * @param {String} _id deal id
  * @param {[String]} doc.productIds
  * @param {String} doc.companyId
  * @param {Number} doc.amount
  * @param {Date} doc.closeDate
  * @param {String} doc.note
  * @param {[String]} doc.assignedUserIds
  * @param {String} doc.boardId
  * @param {String} doc.pipelineId
  * @param {String} doc.stageId
  * @return {Promise} updated deal object
  */
  dealsEdit(root, { _id, ...doc }) {
    return Deals.updateDeals(_id, doc);
  },

  /**
  * Remove deal
  * @param {[String]} ids
  * @return {Promise}
  */
  dealsRemove(root, { ids }) {
    return Deals.removeDeals(ids);
  },
};

moduleRequireLogin(dealMutations);

export default dealMutations;
