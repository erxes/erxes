
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

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

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Users,
      params: pagintationArgs,
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async clientPortalUserDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Users.findOne({ _id });
  },

  async clientPortalCurrentUser(_root, _args, context: IContext) {
    const { portalUser, isPassed2FA } = context;
    if (!portalUser) {
      throw Error('User is not logged in');
    }

    if (portalUser && !isPassed2FA) {
      throw Error('Verify 2FA');
    }
    return portalUser
      ? context.models.Users.getUser({ _id: portalUser._id })
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

    return models.Users.find(filter).countDocuments();
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
    { portalUser, models }: IContext
  ) {
    if (!portalUser) {
      throw new Error('login required');
    }

    const query = { ...args, authorId: portalUser._id, clientPortalId: portalUser.clientPortalId };

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Posts,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },
};

export default clientPortalUserQueries;
