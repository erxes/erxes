import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { ICPCommentDocument } from '@/clientportal/types/comment';

interface GetCommentParams {
  _id: string;
}

interface GetCommentsParams extends ICursorPaginateParams {
  filter?: {
    typeId?: string;
    type?: string;
    parentId?: string;
    userId?: string;
    userType?: string;
  };
}

export const commentQueries: Record<string, Resolver> = {
  async clientPortalComment(
    _root: unknown,
    { _id }: GetCommentParams,
    { models }: IContext,
  ) {
    return models.CPComments.getComment(_id);
  },

  async clientPortalComments(
    _root: unknown,
    params: GetCommentsParams,
    { models }: IContext,
  ) {
    const { filter = {}, ...paginationParams } = params;

    const query: any = {};

    if (filter.typeId) {
      query.typeId = filter.typeId;
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.parentId !== undefined) {
      query.parentId = filter.parentId;
    }

    if (filter.userId) {
      query.userId = filter.userId;
    }

    if (filter.userType) {
      query.userType = filter.userType;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<ICPCommentDocument>({
      model: models.CPComments,
      params: {
        ...paginationParams,
        orderBy: { createdAt: -1 },
      },
      query,
    });

    return { list, totalCount, pageInfo };
  },
};

// Queries accessible to both regular users and CPUsers
commentQueries.clientPortalComment.wrapperConfig = {
  skipPermission: true,
};

commentQueries.clientPortalComments.wrapperConfig = {
  skipPermission: true,
};
