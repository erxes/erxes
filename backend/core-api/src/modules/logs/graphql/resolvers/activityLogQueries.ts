import { IActivityLogDocument } from 'erxes-api-shared/core-modules';
import { cursorPaginate, encodeCursor } from 'erxes-api-shared/utils';
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
    const { list, totalCount, pageInfo } =
      await cursorPaginate<IActivityLogDocument>({
        model: models.ActivityLogs,
        params: {
          ...args,
          limit,
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
