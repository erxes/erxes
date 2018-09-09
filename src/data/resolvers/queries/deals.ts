import { DealBoards, DealPipelines, Deals, DealStages } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const dealQueries = {
  /**
   * Deal Boards list
   */
  dealBoards() {
    return DealBoards.find({}).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Board detail
   */
  dealBoardDetail(_root, { _id }: { _id: string }) {
    return DealBoards.findOne({ _id });
  },

  /**
   * Get last board
   */
  dealBoardGetLast() {
    return DealBoards.findOne().sort({ createdAt: -1 });
  },

  /**
   * Deal Pipelines list
   */
  dealPipelines(_root, { boardId }: { boardId: string }) {
    return DealPipelines.find({ boardId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Stages list
   */
  dealStages(_root, { pipelineId }: { pipelineId: string }) {
    return DealStages.find({ pipelineId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal stage detail
   */
  dealStageDetail(_root, { _id }: { _id: string }) {
    return DealStages.findOne({ _id });
  },

  /**
   * Deals list
   */
  deals(_root, { stageId, customerId, companyId }: { stageId: string; customerId: string; companyId: string }) {
    const filter: any = {};

    if (stageId) {
      filter.stageId = stageId;
    }

    if (customerId) {
      filter.customerIds = { $in: [customerId] };
    }

    if (companyId) {
      filter.companyIds = { $in: [companyId] };
    }

    return Deals.find(filter).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal detail
   */
  dealDetail(_root, { _id }: { _id: string }) {
    return Deals.findOne({ _id });
  },
};

moduleRequireLogin(dealQueries);

export default dealQueries;
