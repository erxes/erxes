import {
  Boards,
  Deals,
  Pipelines,
  Segments,
  Stages,
  Tasks,
  Tickets,
  Users
} from '../../../db/models';
import { BOARD_STATUSES } from '../../../db/models/definitions/constants';
import { fetchSegment } from '../../modules/segments/queryBuilder';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate, regexSearchText } from '../../utils';
import { IConformityQueryParams } from './types';
import { getCollection } from '../../../db/models/boardUtils';

export interface IDate {
  month: number;
  year: number;
}

export interface IListParams extends IConformityQueryParams {
  pipelineId: string;
  stageId: string;
  skip?: number;
  limit?: number;
  date?: IDate;
  search?: string;
  customerIds?: string[];
  companyIds?: string[];
  assignedUserIds?: string[];
  sortField?: string;
  sortDirection?: number;
  labelIds?: string[];
  userIds?: string[];
  segment?: string;
}

const boardQueries = {
  /**
   *  Boards list
   */
  boards(
    _root,
    { type }: { type: string },
    { user, commonQuerySelector }: IContext
  ) {
    const pipelineFilter = user.isOwner
      ? {}
      : {
          $or: [
            { $eq: ['$visibility', 'public'] },
            {
              $and: [
                { $eq: ['$visibility', 'private'] },
                {
                  $or: [
                    { $in: [user._id, '$memberIds'] },
                    { $eq: ['$userId', user._id] }
                  ]
                }
              ]
            }
          ]
        };

    return Boards.aggregate([
      { $match: { ...commonQuerySelector, type } },
      {
        $lookup: {
          from: 'pipelines',
          let: { boardId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$boardId', '$$boardId'] },
                    { ...pipelineFilter }
                  ]
                }
              }
            },
            { $project: { name: 1 } }
          ],
          as: 'pipelines'
        }
      }
    ]);
  },

  /**
   *  Boards count
   */
  async boardCounts(
    _root,
    { type }: { type: string },
    { commonQuerySelector }: IContext
  ) {
    const boards = await Boards.find({ ...commonQuerySelector, type }).sort({
      name: 1
    }).lean();

    const counts: Array<{ _id: string; name: string; count: number }> = [];

    let allCount = 0;

    for (const board of boards) {
      const count = await Pipelines.find({
        boardId: board._id
      }).countDocuments();

      counts.push({
        _id: board._id,
        name: board.name || '',
        count
      });

      allCount += count;
    }

    counts.unshift({ _id: '', name: 'All', count: allCount });

    return counts;
  },

  /**
   *  Board detail
   */
  boardDetail(
    _root,
    { _id }: { _id: string },
    { commonQuerySelector }: IContext
  ) {
    return Boards.findOne({ ...commonQuerySelector, _id }).lean();
  },

  /**
   * Get last board
   */
  boardGetLast(
    _root,
    { type }: { type: string },
    { commonQuerySelector }: IContext
  ) {
    return Boards.findOne({ ...commonQuerySelector, type }).sort({
      createdAt: -1
    }).lean();
  },

  /**
   *  Pipelines list
   */
  pipelines(
    _root,
    {
      boardId,
      type,
      isAll,
      ...queryParams
    }: {
      boardId: string;
      type: string;
      isAll: boolean;
      page: number;
      perPage: number;
    },
    { user }
  ) {
    const query: any =
      user.isOwner || isAll
        ? {}
        : {
            status: { $ne: 'archived' },
            $or: [
              { visibility: 'public' },
              {
                $and: [
                  { visibility: 'private' },
                  {
                    $or: [
                      { memberIds: { $in: [user._id] } },
                      { userId: user._id }
                    ]
                  }
                ]
              }
            ]
          };

    const { page, perPage } = queryParams;

    if (boardId) {
      query.boardId = boardId;
    }

    if (type) {
      query.type = type;
    }

    if (page && perPage) {
      return paginate(
        Pipelines.find(query).sort({ createdAt: 1 }),
        queryParams
      );
    }

    return Pipelines.find(query).sort({ order: 1, createdAt: -1 }).lean();
  },

  async pipelineStateCount(
    _root,
    { boardId, type }: { boardId: string; type: string }
  ) {
    const query: any = {};

    if (boardId) {
      query.boardId = boardId;
    }

    if (type) {
      query.type = type;
    }

    const counts: any = {};
    const now = new Date();

    const notStartedQuery = {
      ...query,
      startDate: { $gt: now }
    };

    const notStartedCount = await Pipelines.find(
      notStartedQuery
    ).countDocuments();

    counts['Not started'] = notStartedCount;

    const inProgressQuery = {
      ...query,
      startDate: { $lt: now },
      endDate: { $gt: now }
    };

    const inProgressCount = await Pipelines.find(
      inProgressQuery
    ).countDocuments();

    counts['In progress'] = inProgressCount;

    const completedQuery = {
      ...query,
      endDate: { $lt: now }
    };

    const completedCounted = await Pipelines.find(
      completedQuery
    ).countDocuments();

    counts.Completed = completedCounted;

    counts.All = notStartedCount + inProgressCount + completedCounted;

    return counts;
  },

  /**
   *  Pipeline detail
   */
  pipelineDetail(_root, { _id }: { _id: string }) {
    return Pipelines.findOne({ _id }).lean();
  },

  /**
   *  Pipeline detail
   */
  async pipelineAssignedUsers(_root, { _id }: { _id: string }) {
    const pipeline = await Pipelines.getPipeline(_id);
    const stageIds = await Stages.find({ pipelineId: pipeline._id }).distinct(
      '_id'
    );

    const { collection } = getCollection(pipeline.type);

    const assignedUserIds = await collection
      .find({ stageId: { $in: stageIds } })
      .distinct('assignedUserIds');

    return Users.find({ _id: { $in: assignedUserIds } }).lean();
  },

  /**
   *  Stages list
   */
  stages(
    _root,
    {
      pipelineId,
      isNotLost,
      isAll
    }: { pipelineId: string; isNotLost: boolean; isAll: boolean }
  ) {
    const filter: any = {};

    filter.pipelineId = pipelineId;

    if (isNotLost) {
      filter.probability = { $ne: 'Lost' };
    }

    if (!isAll) {
      filter.$or = [{ status: null }, { status: BOARD_STATUSES.ACTIVE }];
    }

    return Stages.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  },

  /**
   *  Stage detail
   */
  stageDetail(_root, { _id }: { _id: string }) {
    return Stages.findOne({ _id }).lean();
  },

  /**
   *  Archived stages
   */

  archivedStages(
    _root,
    {
      pipelineId,
      search,
      ...listArgs
    }: { pipelineId: string; search?: string; page?: number; perPage?: number }
  ) {
    const filter: any = { pipelineId, status: BOARD_STATUSES.ARCHIVED };

    if (search) {
      Object.assign(filter, regexSearchText(search, 'name'));
    }

    return paginate(Stages.find(filter).sort({ createdAt: -1 }), listArgs);
  },

  archivedStagesCount(
    _root,
    { pipelineId, search }: { pipelineId: string; search?: string }
  ) {
    const filter: any = { pipelineId, status: BOARD_STATUSES.ARCHIVED };

    if (search) {
      Object.assign(filter, regexSearchText(search, 'name'));
    }

    return Stages.countDocuments(filter);
  },

  /**
   *  ConvertTo info
   */
  async convertToInfo(_root, { conversationId }: { conversationId: string }) {
    const filter = { sourceConversationIds: { $in: [conversationId] } };
    let dealUrl = '';
    let ticketUrl = '';
    let taskUrl = '';

    const deal = await Deals.findOne(filter).lean();

    if (deal) {
      const stage = await Stages.getStage(deal.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      dealUrl = `/deal/board?_id=${board._id}&pipelineId=${pipeline._id}&itemId=${deal._id}`;
    }

    const task = await Tasks.findOne(filter).lean();

    if (task) {
      const stage = await Stages.getStage(task.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      taskUrl = `/task/board?_id=${board._id}&pipelineId=${pipeline._id}&itemId=${task._id}`;
    }

    const ticket = await Tickets.findOne(filter).lean();

    if (ticket) {
      const stage = await Stages.getStage(ticket.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      ticketUrl = `/ticket/board?_id=${board._id}&pipelineId=${pipeline._id}&itemId=${ticket._id}`;
    }

    return {
      dealUrl,
      ticketUrl,
      taskUrl
    };
  },

  async itemsCountBySegments(
    _root,
    {
      type,
      boardId,
      pipelineId
    }: { type: string; boardId: string; pipelineId: string }
  ) {
    const segments = await Segments.find({
      contentType: type,
      boardId,
      pipelineId
    }).lean();

    const counts = {};

    for (const segment of segments) {
      counts[segment._id] = await fetchSegment(segment, {
        pipelineId,
        returnCount: true
      });
    }

    return counts;
  }
};

moduleRequireLogin(boardQueries);

export default boardQueries;
