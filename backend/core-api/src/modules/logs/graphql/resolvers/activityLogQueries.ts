import { IActivityLogDocument } from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
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

  if (params.meta && typeof params.meta === 'object') {
    // Support filtering by any field in metadata using dot notation
    // Handles both flat keys with dots and nested objects
    const buildMetaFilter = (obj: any, prefix: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Recursively handle nested objects
          buildMetaFilter(value, fieldPath);
        } else {
          // Set the filter for this field
          filter[`metadata.${fieldPath}`] = value;
        }
      }
    };
    
    buildMetaFilter(params.meta);
  }

  return filter;
};

export const activityLogQueries = {
  async activityLogs(_root, args, { models }: IContext) {
    const filter = generateFilters(args);

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IActivityLogDocument>({
        model: models.ActivityLogs,
        params: {
          ...args,
          orderBy: { createdAt: -1 },
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
