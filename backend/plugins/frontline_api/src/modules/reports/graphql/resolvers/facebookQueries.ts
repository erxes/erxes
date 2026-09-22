import { PipelineStage } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IFacebookReportFilters } from '@/reports/@types/reportFilters';
import { calculatePercentage } from '@/reports/utils';

type FacebookQueryArgs = { filters?: IFacebookReportFilters };

type ActivityBucket = {
  conversations: number;
  messages: number;
  comments: number;
};

const DEFAULT_POST_LIMIT = 10;

const buildDateRange = (filters: IFacebookReportFilters) => {
  if (!filters.fromDate && !filters.toDate) {
    return null;
  }

  const range: { $gte?: Date; $lte?: Date } = {};

  if (filters.fromDate) {
    range.$gte = new Date(filters.fromDate);
  }

  if (filters.toDate) {
    range.$lte = new Date(filters.toDate);
  }

  return range;
};

const buildMatch = (
  filters: IFacebookReportFilters,
  dateField: string,
): Record<string, any> => {
  const match: Record<string, any> = {};
  const range = buildDateRange(filters);

  if (range) {
    match[dateField] = range;
  }

  if (filters.pageIds?.length) {
    match.recipientId = { $in: filters.pageIds };
  }

  return match;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildPostSearchMatch = (filters: IFacebookReportFilters) => {
  const searchValue = filters.searchValue?.trim();

  if (!searchValue) {
    return {};
  }

  const pattern = new RegExp(escapeRegex(searchValue), 'i');

  return { $or: [{ content: pattern }, { postId: pattern }] };
};

const buildMessageStages = (
  filters: IFacebookReportFilters,
  conversationCollection: string,
): PipelineStage[] => {
  const stages: PipelineStage[] = [];
  const range = buildDateRange(filters);

  stages.push({ $match: range ? { createdAt: range } : {} });

  if (filters.pageIds?.length) {
    stages.push(
      {
        $lookup: {
          from: conversationCollection,
          localField: 'conversationId',
          foreignField: '_id',
          as: '__conversation',
        },
      },
      { $unwind: '$__conversation' },
      { $match: { '__conversation.recipientId': { $in: filters.pageIds } } },
    );
  }

  return stages;
};

const buildDayGroup = (dateField: string): PipelineStage[] => [
  { $match: { [dateField]: { $type: 'date' } } },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } },
      count: { $sum: 1 },
    },
  },
];

const emptyBucket = (): ActivityBucket => ({
  conversations: 0,
  messages: 0,
  comments: 0,
});

export const reportFacebookQueries = {
  async reportFacebookPages(
    _parent: undefined,
    _args: unknown,
    { models }: IContext,
  ) {
    const integrations = await models.FacebookIntegrations.find(
      { facebookPageIds: { $exists: true, $ne: [] } },
      { facebookPageIds: 1, erxesApiId: 1 },
    ).lean();

    const pageIds = new Set<string>();
    const erxesApiIdsByPageId = new Map<string, string[]>();

    for (const integration of integrations) {
      for (const pageId of integration.facebookPageIds || []) {
        if (!pageId) {
          continue;
        }

        pageIds.add(pageId);

        if (integration.erxesApiId) {
          const linked = erxesApiIdsByPageId.get(pageId) || [];
          linked.push(integration.erxesApiId);
          erxesApiIdsByPageId.set(pageId, linked);
        }
      }
    }

    if (!pageIds.size) {
      return [];
    }

    const linkedIds = [...new Set([...erxesApiIdsByPageId.values()].flat())];

    const [inboxIntegrations, bots] = await Promise.all([
      linkedIds.length
        ? models.Integrations.find(
            { _id: { $in: linkedIds } },
            { name: 1 },
          ).lean()
        : Promise.resolve([]),
      models.FacebookBots.find(
        { pageId: { $in: [...pageIds] } },
        { pageId: 1, name: 1 },
      ).lean(),
    ]);

    const integrationNameById = new Map<string, string>(
      inboxIntegrations.flatMap((integration) => {
        const name = integration.name?.trim();

        return name
          ? [[String(integration._id), name] as [string, string]]
          : [];
      }),
    );

    const botNameByPageId = new Map<string, string>(
      bots.flatMap((bot) => {
        const name = bot.name?.trim();

        return bot.pageId && name
          ? [[bot.pageId, name] as [string, string]]
          : [];
      }),
    );

    return [...pageIds].map((pageId) => {
      const linkedName = (erxesApiIdsByPageId.get(pageId) || [])
        .map((erxesApiId) => integrationNameById.get(erxesApiId))
        .find(Boolean);

      return {
        _id: pageId,
        name: linkedName || botNameByPageId.get(pageId) || pageId,
      };
    });
  },

  async reportFacebookSummary(
    _parent: undefined,
    { filters = {} }: FacebookQueryArgs,
    { models }: IContext,
  ) {
    const conversationMatch = buildMatch(filters, 'timestamp');
    const commentMatch = buildMatch(filters, 'createdAt');
    const postMatch = buildMatch(filters, 'timestamp');

    const [
      conversations,
      botConversations,
      comments,
      replies,
      posts,
      messageStats,
    ] = await Promise.all([
      models.FacebookConversations.countDocuments(conversationMatch),
      models.FacebookConversations.countDocuments({
        ...conversationMatch,
        $or: [{ isBot: true }, { botId: { $nin: [null, ''] } }],
      }),
      models.FacebookCommentConversation.countDocuments(commentMatch),
      models.FacebookCommentConversationReply.countDocuments(commentMatch),
      models.FacebookPostConversations.countDocuments(postMatch),
      models.FacebookConversationMessages.aggregate([
        ...buildMessageStages(
          filters,
          models.FacebookConversations.collection.name,
        ),
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            bot: { $sum: { $cond: [{ $eq: ['$fromBot', true] }, 1, 0] } },
            staff: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$fromBot', true] },
                      {
                        $not: [
                          { $in: [{ $ifNull: ['$userId', null] }, [null, '']] },
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const { total = 0, bot = 0, staff = 0 } = messageStats[0] || {};

    return {
      posts,
      comments: comments + replies,
      conversations,
      messages: total,
      incomingMessages: Math.max(total - bot - staff, 0),
      botMessages: bot,
      staffMessages: staff,
      botConversations,
      botCoverage: calculatePercentage(botConversations, conversations),
    };
  },

  async reportFacebookActivity(
    _parent: undefined,
    { filters = {} }: FacebookQueryArgs,
    { models }: IContext,
  ) {
    const conversationMatch = buildMatch(filters, 'timestamp');
    const commentMatch = buildMatch(filters, 'createdAt');

    const [conversationRows, messageRows, commentRows] = await Promise.all([
      models.FacebookConversations.aggregate([
        { $match: conversationMatch },
        ...buildDayGroup('timestamp'),
      ]),
      models.FacebookConversationMessages.aggregate([
        ...buildMessageStages(
          filters,
          models.FacebookConversations.collection.name,
        ),
        ...buildDayGroup('createdAt'),
      ]),
      models.FacebookCommentConversation.aggregate([
        { $match: commentMatch },
        ...buildDayGroup('createdAt'),
      ]),
    ]);

    const buckets = new Map<string, ActivityBucket>();

    const collect = (
      rows: Array<{ _id: string; count: number }>,
      key: keyof ActivityBucket,
    ) => {
      for (const row of rows) {
        if (!row._id) {
          continue;
        }

        const bucket = buckets.get(row._id) || emptyBucket();
        bucket[key] = row.count;
        buckets.set(row._id, bucket);
      }
    };

    collect(conversationRows, 'conversations');
    collect(messageRows, 'messages');
    collect(commentRows, 'comments');

    return [...buckets.entries()]
      .map(([date, bucket]) => ({ date, ...bucket }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async reportFacebookPosts(
    _parent: undefined,
    { filters = {} }: FacebookQueryArgs,
    { models }: IContext,
  ) {
    const limit = filters.limit ?? DEFAULT_POST_LIMIT;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const skip = (page - 1) * limit;

    const rows = await models.FacebookPostConversations.aggregate([
      {
        $match: {
          ...buildMatch(filters, 'timestamp'),
          ...buildPostSearchMatch(filters),
        },
      },
      {
        $group: {
          _id: '$postId',
          postId: { $first: '$postId' },
          content: { $first: '$content' },
          permalink_url: { $first: '$permalink_url' },
          timestamp: { $max: '$timestamp' },
          metaCommentCount: { $max: '$metaCommentCount' },
          metaReactionCount: { $max: '$metaReactionCount' },
          metaShareCount: { $max: '$metaShareCount' },
          metaSyncedAt: { $max: '$metaSyncedAt' },
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'value' }],
          list: [
            { $sort: { timestamp: -1, _id: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: models.FacebookCommentConversation.collection.name,
                localField: 'postId',
                foreignField: 'postId',
                as: '__comments',
              },
            },
            {
              $lookup: {
                from: models.FacebookCommentConversationReply.collection.name,
                localField: '__comments.comment_id',
                foreignField: 'parentId',
                as: '__replies',
              },
            },
            {
              $project: {
                _id: '$postId',
                content: 1,
                permalink: '$permalink_url',
                postedAt: '$timestamp',
                comments: { $size: '$__comments' },
                replies: { $size: '$__replies' },
                commenters: {
                  $size: {
                    $setUnion: [
                      {
                        $filter: {
                          input: '$__comments.senderId',
                          as: 'senderId',
                          cond: { $ne: ['$$senderId', null] },
                        },
                      },
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$__replies',
                              as: 'reply',
                              cond: {
                                $and: [
                                  {
                                    $ne: [
                                      { $ifNull: ['$$reply.senderId', null] },
                                      null,
                                    ],
                                  },
                                  {
                                    $eq: [
                                      { $ifNull: ['$$reply.userId', null] },
                                      null,
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                          as: 'reply',
                          in: '$$reply.senderId',
                        },
                      },
                    ],
                  },
                },
                metaCommentCount: 1,
                metaReactionCount: 1,
                metaShareCount: 1,
                metaSyncedAt: 1,
                lastActivityAt: {
                  $max: {
                    $concatArrays: [
                      '$__comments.createdAt',
                      '$__replies.createdAt',
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    const totalCount = rows[0]?.totalCount?.[0]?.value ?? 0;

    return {
      list: rows[0]?.list ?? [],
      totalCount,
      page,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 0,
    };
  },

  async reportFacebookBots(
    _parent: undefined,
    { filters = {} }: FacebookQueryArgs,
    { models }: IContext,
  ) {
    const conversationMatch = buildMatch(filters, 'timestamp');

    const [conversationRows, messageRows, totalConversations] =
      await Promise.all([
        models.FacebookConversations.aggregate([
          { $match: { ...conversationMatch, botId: { $nin: [null, ''] } } },
          { $group: { _id: '$botId', count: { $sum: 1 } } },
        ]),
        models.FacebookConversationMessages.aggregate([
          ...buildMessageStages(
            filters,
            models.FacebookConversations.collection.name,
          ),
          { $match: { botId: { $nin: [null, ''] } } },
          { $group: { _id: '$botId', count: { $sum: 1 } } },
        ]),
        models.FacebookConversations.countDocuments(conversationMatch),
      ]);

    if (!conversationRows.length && !messageRows.length) {
      return [];
    }

    const messageCountByBot = new Map<string, number>(
      messageRows.map((row) => [String(row._id), row.count]),
    );

    const botIds = [
      ...new Set([
        ...conversationRows.map((row) => String(row._id)),
        ...messageCountByBot.keys(),
      ]),
    ];

    const bots = await models.FacebookBots.find(
      { _id: { $in: botIds } },
      { name: 1, pageId: 1 },
    ).lean();

    const botById = new Map(bots.map((bot) => [String(bot._id), bot]));
    const conversationCountByBot = new Map<string, number>(
      conversationRows.map((row) => [String(row._id), row.count]),
    );

    return botIds
      .map((botId) => {
        const count = conversationCountByBot.get(botId) ?? 0;

        return {
          _id: botId,
          name: botById.get(botId)?.name || 'Unknown Bot',
          pageId: botById.get(botId)?.pageId || '',
          count,
          messages: messageCountByBot.get(botId) ?? 0,
          percentage: calculatePercentage(count, totalConversations),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, filters.limit ?? 100);
  },
};
