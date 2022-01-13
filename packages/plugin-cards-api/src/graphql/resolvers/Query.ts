import { Boards, Deals, Pipelines, Stages, Tasks, Tickets } from '../../models';
import { BOARD_STATUSES } from '../../models/definitions/constants';
// import { fetchSegment } from '../../modules/segments/queryBuilder';
// import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext, paginate, regexSearchText } from '@erxes/api-utils';
// import { IConformityQueryParams } from './types';
import { getCollection } from '../../models/boardUtils';
import { IStageDocument } from '../../models/definitions/boards';
import { CLOSE_DATE_TYPES, PRIORITIES } from '../../constants';
// import { IPipelineLabelDocument } from '../../../db/models/definitions/pipelineLabels';
import { getCloseDateByType } from './boardUtils1';
import { _PipelineLabels, _Segments, _Users } from '../../db';

export interface IDate {
  month: number;
  year: number;
}

export interface IConformityQueryParams {
  conformityMainType?: string;
  conformityMainTypeId?: string;
  conformityIsRelated?: boolean;
  conformityIsSaved?: boolean;
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
    const boards = await Boards.find({ ...commonQuerySelector, type })
      .sort({
        name: 1
      })
      .lean();

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
    return Boards.findOne({ ...commonQuerySelector, type })
      .sort({
        createdAt: -1
      })
      .lean();
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

    return Pipelines.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();
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
   *  Pipeline related assigned users
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

    return _Users.find({ _id: { $in: assignedUserIds } }).lean();
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

    return Stages.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
  },

  async itemsCountByAssignedUser(
    _root,
    {
      pipelineId,
      type,
      stackBy
    }: { pipelineId: string; type: string; stackBy: string }
  ) {
    let groups;
    let detailFilter;

    const stages = await Stages.find({ pipelineId });

    if (stages.length === 0) {
      return {};
    }

    const stageIds = stages.map(stage => stage._id);

    const filter: any = {
      stageId: { $in: stageIds },
      status: BOARD_STATUSES.ACTIVE
    };

    switch (stackBy) {
      case 'priority': {
        groups = PRIORITIES.ALL;

        filter.priority = { $in: PRIORITIES.ALL.map(p => p.name) };

        detailFilter = ({ name }: { name: string }) => ({
          priority: name,
          stageId: { $in: stageIds }
        });

        break;
      }

      case 'label': {
        const labels = await _PipelineLabels.find({ pipelineId });

        groups = labels.map(label => ({
          _id: label._id,
          name: label.name,
          color: label.colorCode
        }));

        filter.labelIds = { $in: labels.map(g => g._id) };

        // detailFilter = (label: IPipelineLabelDocument) => ({
        //   labelIds: { $in: [label._id] },
        //   stageId: { $in: stageIds }
        // });

        break;
      }

      case 'dueDate': {
        groups = CLOSE_DATE_TYPES.ALL;

        detailFilter = ({ value }: { value: string }) => ({
          closeDate: getCloseDateByType(value),
          stageId: { $in: stageIds }
        });

        break;
      }

      // when stage
      default: {
        groups = stages.map(stage => ({
          _id: stage._id,
          name: stage.name
        }));

        detailFilter = (stage: IStageDocument) => ({ stageId: stage._id });
      }
    }

    const { collection } = getCollection(type);

    const assignedUserIds = await collection
      .find(filter)
      .distinct('assignedUserIds');

    if (assignedUserIds.length === 0) {
      return {};
    }

    const users = await _Users.find({ _id: { $in: assignedUserIds } });

    const usersWithInfo: Array<{ name: string }> = [];
    const countsByGroup = {};

    for (const groupItem of groups) {
      const countsByGroupItem = await collection.find({
        'assignedUserIds.0': { $exists: true },
        status: BOARD_STATUSES.ACTIVE,
        ...detailFilter(groupItem)
      });

      countsByGroup[groupItem.name || ''] = countsByGroupItem;
    }

    for (const user of users) {
      const groupWithCount = {};

      for (const groupItem of groups) {
        groupWithCount[groupItem.name || ''] = countsByGroup[
          groupItem.name || ''
        ].filter(item =>
          (item.assignedUserIds || []).includes(user._id)
        ).length;
      }

      usersWithInfo.push({
        name: user.details
          ? user.details.fullName || user.email || 'No name'
          : 'No name',
        ...groupWithCount
      });
    }

    return {
      usersWithInfo,
      groups
    };
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
    {}: // type,
    // boardId,
    // pipelineId
    { type: string; boardId: string; pipelineId: string }
  ) {
    // const segments = await _Segments
    //   .find({
    //     contentType: type,
    //     boardId,
    //     pipelineId
    //   })
    //   .lean();

    const counts = {};

    // for (const segment of segments) {
    //   counts[segment._id] = await fetchSegment(segment, {
    //     pipelineId,
    //     returnCount: true
    //   });
    // }

    return counts;
  }
};

// moduleRequireLogin(boardQueries);

export default boardQueries;
