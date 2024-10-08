import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  pages: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const {
      page,
      perPage,
      kind,
    } = args;

    const query: any = {
      clientPortalId: args.clientPortalId,
    };

    if (kind) {
      query.kind = kind;
    }

    if (page && perPage) {
      return paginate(
        models.Pages.find(query).sort({ createdAt: 1 }),
        { page, perPage }
      );
    }

    return models.Pages.find(query).sort({ createdAt: 1 });
  },

  page: async (parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { _id } = args;

    return models.Pages.findOne({ $or: [{ _id }, { slug: _id }] });
  },
};

export default queries;
