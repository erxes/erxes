import {
  CLOSE_DATE_TYPES,
  PRIORITIES,
  SALES_STATUSES,
} from '~/modules/sales/constants';
import { IPipelineLabelDocument, IStageDocument } from '~/modules/sales/@types';

import { IContext } from '~/connectionResolvers';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { getCloseDateByType } from '~/modules/sales/utils';
import { moduleRequireLogin } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const boardQueries = {
  /**
   *  Boards list
   */
  async salesBoards(_root: undefined, _args: undefined, { models }: IContext) {
    return models.Boards.find({}).lean();
  },

  /**
   *  Boards count
   */
  async salesBoardCounts(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const boards = await models.Boards.find()
      .sort({
        name: 1,
      })
      .lean();

    const counts: Array<{ _id: string; name: string; count: number }> = [];

    let allCount = 0;

    for (const board of boards) {
      const count = await models.Pipelines.find({
        boardId: board._id,
      }).countDocuments();

      counts.push({
        _id: board._id,
        name: board.name || '',
        count,
      });

      allCount += count;
    }

    counts.unshift({ _id: '', name: 'All', count: allCount });

    return counts;
  },

  /**
   *  Board detail
   */
  async salesBoardDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Boards.findOne({ _id }).lean();
  },

  /**
   * Get last board
   */
  async salesBoardGetLast(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Boards.findOne()
      .sort({
        createdAt: -1,
      })
      .lean();
  },

  async salesBoardContentTypeDetail(
    _root: undefined,
    args,
    { models }: IContext,
  ) {
    const { contentType = '', contentId, content } = args;

    let item = {};

    try {
      switch (contentType.split(':')[1]) {
        case 'deal':
          item = await models.Deals.getDeal(contentId);
          break;
        case 'checklist':
          item = (await models.Checklists.findOne({ _id: content._id })) || {};
          break;
        case 'checklistitem':
          item =
            (await models.ChecklistItems.findOne({ _id: content._id })) || {};
          break;
      }
    } catch (e) {
      // debugError(e.message);

      return e.message;
    }

    return item;
  },

  // salesItemsCountByAssignedUser has been moved to salesItemsCount.ts
  async salesItemsCountByAssignedUser(
    _root: undefined,
    args: { pipelineId: string; stackBy: string },
    context: IContext,
  ) {
    const { salesItemsCountByAssignedUser: resolver } = await import('./salesItemsCount');
    return resolver(_root, args, context);
  },

  /**
   *  ConvertTo info
   */
  async salesConvertToInfo(
    _root,
    { conversationId }: { conversationId: string },
    { models: { Deals, Stages, Pipelines, Boards } }: IContext,
  ) {
    const filter = { sourceConversationIds: { $in: [conversationId] } };
    let dealUrl = '';

    const deal = await Deals.findOne(filter).lean();

    if (deal) {
      const stage = await Stages.getStage(deal.stageId);
      const pipeline = await Pipelines.getPipeline(stage.pipelineId);
      const board = await Boards.getBoard(pipeline.boardId);

      dealUrl = `/deal/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${deal._id}`;
    }

    return {
      dealUrl,
    };
  },

  // async salesItemsCountBySegments() {}

  async salesBoardLogs(_root, args, { models, subdomain }: IContext) {
    const { Deals, Stages } = models;
    const { action, content, contentId } = args;

    if (action === 'moved') {
      const item = await Deals.getDeal(contentId);

      const { oldStageId, destinationStageId } = content;

      const destinationStage = await Stages.findOne({
        _id: destinationStageId,
      }).lean();

      const oldStage = await Stages.findOne({ _id: oldStageId }).lean();

      if (destinationStage && oldStage) {
        return {
          destinationStage: destinationStage.name,
          oldStage: oldStage.name,
          item,
        };
      }

      return {
        text: content.text,
      };
    }

    if (action === 'assignee') {
      let addedUsers: IUserDocument[] = [];
      let removedUsers: IUserDocument[] = [];

      if (content) {
        addedUsers = await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: {
            query: {
              _id: { $in: content.addedUserIds },
            },
          },
          defaultValue: [],
        });

        removedUsers = await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: {
            query: {
              _id: { $in: content.removedUserIds },
            },
          },
          defaultValue: [],
        });
      }

      return { addedUsers, removedUsers };
    }
  },

  async salesCardsFields(_root, _args, { models, subdomain }: IContext) {
    const result = {};

    for (const ct of ['deal']) {
      result[ct] = [];

      const groups = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'forms',
        action: 'fieldsGroups.find',
        input: {
          query: {
            contentType: `sales:${ct}`,
          },
        },
        defaultValue: [],
      });

      for (const group of groups) {
        const { config = {} } = group;

        const fields = await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'query',
          module: 'forms',
          action: 'fields.find',
          input: {
            query: {
              contentType: `sales:${ct}`,
            },
          },
          defaultValue: [],
        });

        const pipelines = await models.Pipelines.find({
          _id: { $in: config.pipelineIds || [] },
        });

        for (const pipeline of pipelines) {
          const board = await models.Boards.getBoard(pipeline.boardId);

          for (const field of fields) {
            result[ct].push({
              boardName: board.name,
              pipelineName: pipeline.name,
              fieldId: field._id,
              fieldName: field.text,
            });
          }
        }
      }
    }

    return result;
  },

  async salesCheckFreeTimes(
    _root,
    { pipelineId, intervals },
    { models, subdomain }: IContext,
  ) {
    if (!intervals.length) {
      return [];
    }

    const timezone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;

    const pipeline = await models.Pipelines.getPipeline(pipelineId);

    const latestStartDate = new Date(
      intervals[0].startTime.getTime() - timezone,
    );

    const latestEndDate = new Date(
      intervals[intervals.length - 1].endTime.getTime() - timezone,
    );

    if (!pipeline.tagId) {
      return intervals;
    }

    const tags = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'findWithChild',
      input: {
        query: {
          _id: pipeline.tagId,
        },
        fields: {
          _id: 1,
        },
      },
      defaultValue: [],
    });

    const stages = await models.Stages.find({ pipelineId });

    const stageIds = stages.map((stage) => stage._id);

    const items = await models.Deals.find(
      {
        status: { $ne: 'archived' },
        stageId: { $in: stageIds },
        startDate: {
          $lte: latestEndDate,
        },
        closeDate: {
          $gte: latestStartDate,
        },
        tagIds: { $in: tags.map((t) => t._id) },
      },
      { startDate: 1, closeDate: 1, tagIds: 1 },
    );

    for (const interval of intervals) {
      const startDate = new Date(interval.startTime.getTime() - timezone);

      const endDate = new Date(interval.endTime.getTime() - timezone);

      const checkingItems = items.filter(
        (item) =>
          item.startDate &&
          item.startDate < endDate &&
          item.closeDate &&
          item.closeDate > startDate,
      );

      let checkedTagIds: string[] = [];

      for (const item of checkingItems) {
        checkedTagIds = checkedTagIds.concat(item.tagIds || []);
      }

      interval.freeTags = tags.filter((t) => !checkedTagIds.includes(t._id));
    }

    return intervals;
  },
};

// moduleRequireLogin(boardQueries);
