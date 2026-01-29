import { checkPermission } from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';

interface IClientPortalUserFilterParams {
  clientPortalId?: string;
  searchValue?: string;
  type?: 'customer' | 'company';
  isVerified?: boolean;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  orderBy?: Record<string, number>;
  cursorMode?: string;
  sortMode?: string;
  aggregationPipeline?: unknown[];
}

export const cpUserQueries: Record<string, Resolver> = {
  async clientPortalCurrentUser(
    _root: unknown,
    _args: unknown,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    return cpUser ? await models.CPUser.findOne({ _id: cpUser._id }) : null;
  },

  async getClientPortalUsers(
    _root: unknown,
    args: { filter?: IClientPortalUserFilterParams },
    { models }: IContext,
  ) {
    const filter = args.filter || {};
    const query: Record<string, unknown> = {};

    if (filter.clientPortalId) {
      query.clientPortalId = filter.clientPortalId;
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (typeof filter.isVerified === 'boolean') {
      query.isVerified = filter.isVerified;
    }

    if (filter.searchValue && filter.searchValue.trim()) {
      const regex = new RegExp(
        `.*${escapeRegExp(filter.searchValue.trim())}.*`,
        'i',
      );
      query.$or = [
        { email: regex },
        { phone: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const orderBy: Record<string, SortOrder> = (filter.orderBy as Record<
      string,
      SortOrder
    >) || { createdAt: -1 };

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ICPUserDocument>({
        model: models.CPUser,
        params: {
          ...filter,
          orderBy,
        },
        query,
      });

    return { list, totalCount, pageInfo };
  },

  async getClientPortalUser(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.CPUser.findOne({ _id }).lean();
  },
};

checkPermission(cpUserQueries, 'getClientPortalUsers', 'showClientPortalUsers');
checkPermission(cpUserQueries, 'getClientPortalUser', 'showClientPortalUsers');

cpUserQueries.clientPortalCurrentUser.wrapperConfig = {
  forClientPortal: true,
};
