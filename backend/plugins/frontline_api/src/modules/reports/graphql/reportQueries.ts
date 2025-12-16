import { IContext } from '~/connectionResolvers';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';

export const reportQueries = {
  async chartGetResult(_parent: undefined, _args: any, { models }: IContext) {
    const [openCount, closedCount, resolvedCount] = await Promise.all([
      models.Conversations.countDocuments({
        status: CONVERSATION_STATUSES.OPEN,
      }),
      models.Conversations.countDocuments({
        status: CONVERSATION_STATUSES.CLOSED,
      }),
      models.Conversations.countDocuments({
        status: CONVERSATION_STATUSES.RESOLVED,
      }),
    ]);

    const totalConversations = openCount + closedCount + resolvedCount;

    const calcPercentage = (count: number) =>
      totalConversations > 0
        ? Math.round((count / totalConversations) * 100)
        : 0;

    const conversationTags = await models.Conversations.aggregate([
      {
        $match: {
          status: CONVERSATION_STATUSES.CLOSED,
        },
      },
      { $unwind: '$tagIds' },
      {
        $group: {
          _id: '$tagIds',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topPerformingSources = await models.Conversations.aggregate([
      {
        $lookup: {
          from: 'integrations',
          localField: 'integrationId',
          foreignField: '_id',
          as: 'integration',
        },
      },
      { $unwind: '$integration' },
      {
        $group: {
          _id: '$integration.kind',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topConvertingSources = await models.Conversations.aggregate([
      {
        $match: {
          status: CONVERSATION_STATUSES.CLOSED,
        },
      },
      {
        $lookup: {
          from: 'integrations',
          localField: 'integrationId',
          foreignField: '_id',
          as: 'integration',
        },
      },
      { $unwind: '$integration' },
      {
        $group: {
          _id: '$integration.kind',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return {
      ConversationOpen: {
        count: openCount,
        percentage: calcPercentage(openCount),
      },
      ConversationClosed: {
        count: closedCount,
        percentage: calcPercentage(closedCount),
      },
      ConversationResolved: {
        count: resolvedCount,
        percentage: calcPercentage(resolvedCount),
      },
      ConversationTags: conversationTags,
      ConversationSources: {
        topPerforming: topPerformingSources,
        topConverting: topConvertingSources,
      },
    };
  },
};
