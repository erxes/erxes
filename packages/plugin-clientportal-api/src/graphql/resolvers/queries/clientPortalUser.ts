// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';

import { IContext } from '../../../connectionResolver';

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
      ...pagintationArgs
    }: {
      ids: string[];
      excludeIds: boolean;
      type: string;
      searchValue: string;
      page: number;
      perPage: number;
      cpId: string;
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
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
          }
        },
        {
          lastName: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
          }
        },
        {
          email: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
          }
        },
        {
          phone: {
            $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')]
          }
        },
        { code: { $in: [new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i')] } }
      ];

      filter.$or = fields;
    }

    if (cpId) {
      filter.clientPortalId = cpId;
    }

    return paginate(
      models.ClientPortalUsers.find(filter)
        .sort({ createdAt: -1 })
        .lean(),
      pagintationArgs
    );
  },

  async clientPortalUserDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ClientPortalUsers.findOne({ _id });
  },

  async clientPortalCurrentUser(_root, _args, context: IContext) {
    const { cpUser } = context;

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
  }
};

export default clientPortalUserQueries;
