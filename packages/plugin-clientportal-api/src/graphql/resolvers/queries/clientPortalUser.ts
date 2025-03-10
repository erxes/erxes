// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';

import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const clientPortalUserQueries = {
  /**
   * clientPortal Users list
   */
  async clientPortalUsers(
    _root,
    {
      type,
      searchValue,
      ids,
      excludeIds,
      cpId,
      dateFilters,
      ...pagintationArgs
    }: {
      ids: string[];
      excludeIds: boolean;
      type: string;
      searchValue: string;
      page: number;
      perPage: number;
      cpId: string;
      dateFilters: string;
    },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    if (ids && ids.length > 0) {
      filter._id = { [excludeIds ? '$nin' : '$in']: ids };
    }

    // search =========
    if (searchValue) {
      const fields = [
        {
          firstName: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')],
          },
        },
        {
          lastName: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')],
          },
        },
        {
          email: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')],
          },
        },
        {
          phone: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')],
          },
        },
        {
          code: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] },
        },
      ];

      filter.$or = fields;
    }

    if (cpId) {
      filter.clientPortalId = cpId;
    }

    if (dateFilters) {
      const filters = JSON.parse(dateFilters);

      const rangeFilters: any[] = [];

      for (const key of Object.keys(filters)) {
        const { gte, lte } = filters[key];

        if (gte) {
          const gteFilter: any = {};

          gteFilter[key] = { $gte: gte };

          rangeFilters.push(gteFilter);
        }

        if (lte) {
          const lteFilter: any = {};

          lteFilter[key] = { $lte: lte };

          rangeFilters.push(lteFilter);
        }
      }

      if (rangeFilters.length) {
        filter.$and = rangeFilters;
      }
    }

    return paginate(
      models.ClientPortalUsers.find(filter).sort({ createdAt: -1 }).lean(),
      pagintationArgs
    );
  },

  async clientPortalUserDetail(
    _root,
    { _id }: { _id: string },
    { models, isPassed2FA }: IContext
  ) {
    return models.ClientPortalUsers.findOne({ _id });
  },

  async clientPortalCurrentUser(_root, _args, context: IContext) {
    const { cpUser, isPassed2FA } = context;
    if (!cpUser) {
      throw Error('User is not logged in');
    }

    if (cpUser && !isPassed2FA) {
      throw Error('Verify 2FA');
    }
    return cpUser
      ? context.models.ClientPortalUsers.getUser({ _id: cpUser._id })
      : null;
  },

  async clientPortalUserCounts(
    _root,
    { type }: { type: string },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    return models.ClientPortalUsers.find(filter).countDocuments();
  },

  async clientPortalCompanies(
    _root,
    { clientPortalId }: { clientPortalId: string },
    { models }: IContext
  ) {
    return models.Companies.find({ clientPortalId }).lean();
  },

  async clientPortalUserPosts(
    _root,
    args: any,
    { cpUser, subdomain }: IContext
  ) {
    if (!cpUser) {
      throw new Error('login required');
    }

    const query = { ...args, authorId: cpUser._id, clientPortalId: cpUser.clientPortalId };

    return await sendCommonMessage({
      subdomain,
      serviceName: 'cms',
      action: 'getPostsPaginated',
      data: query,
      isRPC: true,
      defaultValue: null,
    });
  },
};

export default clientPortalUserQueries;
