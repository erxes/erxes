import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const activityQueries = {
  getOperationActivities: async (
    _parent: undefined,
    params: { contentId: string } & ICursorPaginateParams,
    { models }: IContext,
  ) => {
    return cursorPaginate({
      model: models.Activity,
      params: { ...params, orderBy: { createdAt: 1 } },
      query: { contentId: params.contentId },
    });
  },
};
