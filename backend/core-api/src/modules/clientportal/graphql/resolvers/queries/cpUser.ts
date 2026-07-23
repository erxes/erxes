import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { getTokiConnection } from '~/modules/clientportal/utils';

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

export const cpUserQueries: Record<string, Resolver<any, any, IContext>> = {
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

    if (filter?.searchValue?.trim()) {
      const regex = new RegExp(
        `.*${escapeRegExp(filter?.searchValue?.trim())}.*`,
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
  async checkTokiUserLegalAge(_root, { token }, { clientPortal }: IContext) {
    const { apiUrl, apiKey } = getTokiConnection(clientPortal);
    const response = await fetch(
      `${apiUrl}/third-party-service/v1/shoppy/user`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Unable to check Toki user age');
    }

    const { data = {} } = await response.json();

    if (typeof data?.isAdult21 === 'boolean') {
      return data.isAdult21;
    }

    return data?.isAdult === true;
  },
};

cpUserQueries.clientPortalCurrentUser.wrapperConfig = {
  forClientPortal: true,
};
