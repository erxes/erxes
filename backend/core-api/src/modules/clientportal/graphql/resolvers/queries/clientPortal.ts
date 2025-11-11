import { IContext } from '~/connectionResolvers';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';

export const clientPortalQueries = {
  async clientPortals(
    _root: unknown,
    params: ICursorPaginateParams,
    { models }: IContext,
  ) {
    const { list, totalCount, pageInfo } =
      await cursorPaginate<IClientPortalDocument>({
        model: models.ClientPortal,
        params: {
          ...params,
          orderBy: { createdAt: -1 },
        },
        query: {},
      });

    return { list, totalCount, pageInfo };
  },
};

requireLogin(clientPortalQueries, 'clientPortals');
