import { IContext } from '~/connectionResolvers';

import { cursorPaginate } from 'erxes-api-shared/utils';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { Resolver } from 'erxes-api-shared/core-types';

export const clientPortalQueries: Record<string, Resolver> = {
  async getClientPortals(
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

  async getClientPortal(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ClientPortal.findOne({ _id });
  },

  async getCPExamplePosts() {
    const posts = [
      {
        id: '1',
        title: 'Post 1',
        content: 'Content 1',
      },
    ];
    return posts;
  },
};

clientPortalQueries.getCPExamplePosts.wrapperConfig = {
  forClientPortal: true,
};
