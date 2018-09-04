import { DealBoards, DealPipelines, DealStages, Deals } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const dealQueries = {
  /**
   * Deal Boards list
   * @return {Promise} deal boards list
   */
  dealBoards() {
    return DealBoards.find({}).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Board detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} deal board detail
   */
  dealBoardDetail(root, { _id }) {
    return DealBoards.findOne({ _id });
  },

  /**
   * Get last board
   * @return {Promise} last board
   */
  dealBoardGetLast() {
    return DealBoards.findOne().sort({ createdAt: -1 });
  },

  /**
   * Deal Pipelines list
   * @param {Object} args
   * @param {String} args.boardId
   * @return {Promise} filtered pipeline objects by boardId
   */
  dealPipelines(root, { boardId }) {
    return DealPipelines.find({ boardId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Stages list
   * @param {Object} args
   * @param {String} args.pipelineId
   * @return {Promise}  filtered stage objects by pipelineId
   */
  dealStages(root, { pipelineId }) {
    return DealStages.find({ pipelineId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal stage detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} deal stage detail
   */
  dealStageDetail(root, { _id }) {
    return DealStages.findOne({ _id });
  },

  /**
   * Deals list
   * @param {Object} args
   * @param {String} args.stageId
   * @param {String} args.customerId
   * @param {String} args.companyId
   * @return {Promise} filtered deals objects
   */
  deals(root, { stageId, customerId, companyId }) {
    const filter = {};

    if (stageId) filter.stageId = stageId;

    if (customerId) filter.customerIds = { $in: [customerId] };

    if (companyId) filter.companyIds = { $in: [companyId] };

    return Deals.find(filter).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal detail
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} deal detail
   */
  dealDetail(root, { _id }) {
    return Deals.findOne({ _id });
  },
};

moduleRequireLogin(dealQueries);

export default dealQueries;
