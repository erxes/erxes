import { Boards, Deals, Pipelines, Stages, Tasks, Tickets } from '../../../db/models';
import { IConformityQueryParams } from '../../modules/conformities/types';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

export interface IDate {
  month: number;
  year: number;
}

export interface IListParams extends IConformityQueryParams {
  pipelineId: string;
  stageId: string;
  skip?: number;
  date?: IDate;
  search?: string;
  customerIds?: [string];
  companyIds?: [string];
  assignedUserIds?: [string];
  sortField?: string;
  sortDirection?: number;
  labelIds?: [string];
}

const boardQueries = {
  /**
   *  Boards list
   */
  boards(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    return Boards.find({ ...commonQuerySelector, type }).sort({ order: 1, createdAt: -1 });
  },

  /**
   *  Boards count
   */
  async boardCounts(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    const boards = await Boards.find({ ...commonQuerySelector, type }).sort({ name: 1 });

    const counts = [{ _id: '', name: 'All', count: await Pipelines.find({ type }).countDocuments() }];

    for (const board of boards) {
      counts.push({
        _id: board._id,
        name: board.name || '',
        count: await Pipelines.find({ boardId: board._id }).countDocuments(),
      });
    }

    return counts;
  },

  /**
   *  Board detail
   */
  boardDetail(_root, { _id }: { _id: string }, { commonQuerySelector }: IContext) {
    return Boards.findOne({ ...commonQuerySelector, _id });
  },

  /**
   * Get last board
   */
  boardGetLast(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    return Boards.findOne({ ...commonQuerySelector, type }).sort({ createdAt: -1 });
  },

  /**
   *  Pipelines list
   */
  pipelines(_root, { boardId }: { boardId: string; type: string }) {
    return Pipelines.find({ boardId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   *  Pipeline detail
   */
  pipelineDetail(_root, { _id }: { _id: string }) {
    return Pipelines.findOne({ _id });
  },

  /**
   *  Stages list
   */
  stages(_root, { pipelineId, isNotLost }: { pipelineId: string; isNotLost: boolean }) {
    const filter: any = {};

    filter.pipelineId = pipelineId;

    if (isNotLost) {
      filter.probability = { $ne: 'Lost' };
    }

    return Stages.find(filter).sort({ order: 1, createdAt: -1 });
  },

  /**
   *  Stage detail
   */
  stageDetail(_root, { _id }: { _id: string }) {
    return Stages.findOne({ _id });
  },

  /**
   *  ConvertTo info
   */
  async convertToInfo(_root, { conversationId }: { conversationId: string }) {
    const filter = { sourceConversationId: conversationId };
    let dealUrl = '';
    let ticketUrl = '';
    let taskUrl = '';

    const deal = await Deals.findOne(filter);

    if (deal) {
      const stage = await Stages.getStage(deal.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      dealUrl = `/deal/board?_id=${board._id}&pipelineId=${pipeline._id}&itemId=${deal._id}`;
    }

    const task = await Tasks.findOne(filter);

    if (task) {
      const stage = await Stages.getStage(task.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      taskUrl = `/task/board?_id=${board._id}&pipelineId=${pipeline._id}&itemId=${task._id}`;
    }

    const ticket = await Tickets.findOne(filter);

    if (ticket) {
      const stage = await Stages.getStage(ticket.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      ticketUrl = `/inbox/ticket/board?_id=${board._id}&pipelineId=${pipeline._id}&itemId=${ticket._id}`;
    }

    return {
      dealUrl,
      ticketUrl,
      taskUrl,
    };
  },
};

moduleRequireLogin(boardQueries);

export default boardQueries;
