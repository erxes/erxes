import { IActivityLogDocument } from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { encodeCursor } from 'erxes-api-shared/utils/mongo/cursor-util';
import { IContext } from '~/connectionResolvers';

const generateFilters = (params: any) => {
  const filter: any = {};

  if (params.targetType) {
    filter.targetType = params.targetType;
  }
  if (params.targetId) {
    filter.targetId = params.targetId;
  }

  if (params.action) {
    filter['action.action'] = params.action;
  }

  return filter;
};

export const activityLogQueries = {
  async activityLogs(_root, args, { models }: IContext) {
    const filter = generateFilters(args);
    const variant = args.variant === 'backward' ? 'backward' : 'forward';
    const limit = Math.min(Math.max(args.limit || 20, 1), 100);

    if (variant === 'backward' && !args.cursor) {
      const totalCount = await models.ActivityLogs.countDocuments(filter);

      const latestLogs = await models.ActivityLogs.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .lean();

      const list = latestLogs.reverse();
      const sortFields = ['createdAt'];

      return {
        list,
        totalCount,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: totalCount > list.length,
          startCursor:
            list.length > 0 ? encodeCursor(list[0], sortFields) : null,
          endCursor:
            list.length > 0
              ? encodeCursor(list[list.length - 1], sortFields)
              : null,
        },
      };
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IActivityLogDocument>({
        model: models.ActivityLogs,
        params: {
          ...args,
          direction: variant,
          orderBy: { createdAt: variant === 'backward' ? 1 : -1 },
        },
        query: filter,
      });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },
};

export default activityLogQueries;
