import { DealBoards, DealPipelines, DealStages, Deals } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const dealQueries = {
  /**
   * Deal Boards list
   * @return {Promise} deal boards list
   */
  dealBoards() {
    return DealBoards.find({});
  },

  /**
   * Deal Pipelines list
   * @param {Object} args
   * @param {String} args.boardId
   * @return {Promise}  filtered pipeline objects by boardId
   */
  dealPipelines(root, { boardId }) {
    return DealPipelines.find({ boardId });
  },

  /**
   * Deal Stages list
   * @param {Object} args
   * @param {String} args.boardId
   * @param {String} args.pipelineId
   * @return {Promise}  filtered stage objects by pipelineId
   */
  dealStages(root, { boardId, pipelineId }) {
    const filter = { pipelineId };

    if (boardId) filter.boardId = boardId;

    return DealStages.find(filter);
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
    const filter = { stageId };

    if (boardId) filter.boardId = boardId;

    if (pipelineId) filter.pipelineId = pipelineId;

    return Deals.find(filter);
  },
};

moduleRequireLogin(dealQueries);

export default dealQueries;
