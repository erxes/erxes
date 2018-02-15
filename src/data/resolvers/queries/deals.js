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
   * @return {Promise} deal boards list
   */
  dealBoardDetail(root, { _id }) {
    return DealBoards.findOne({ _id });
  },

  /**
   * Get last board
   * @return {Promise} board
   */
  async dealBoardGetLast() {
    return DealBoards.findOne().sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Pipelines list
   * @param {Object} args
   * @param {String} args.boardId
   * @return {Promise}  filtered pipeline objects by boardId
   */
  dealPipelines(root, { boardId }) {
    return DealPipelines.find({ boardId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Stages list
   * @param {Object} args
   * @param {String} args.boardId
   * @param {String} args.pipelineId
   * @return {Promise}  filtered stage objects by pipelineId
   */
  dealStages(root, { boardId, pipelineId }) {
    const filter = {};

    if (pipelineId) filter.pipelineId = pipelineId;

    if (boardId) filter.boardId = boardId;

    return DealStages.find(filter).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deals list
   * @param {Object} args
   * @param {String} args.boardId
   * @param {String} args.pipelineId
   * @param {String} args.stageId
   * @return {Promise}  filtered pipeline objects by stageId
   */
  deals(root, { boardId, pipelineId, stageId }) {
    const filter = {};

    if (stageId) filter.stageId = stageId;

    if (boardId) filter.boardId = boardId;

    if (pipelineId) filter.pipelineId = pipelineId;

    return Deals.find(filter).sort({ order: 1, createdAt: -1 });
  },
};

moduleRequireLogin(dealQueries);

export default dealQueries;
