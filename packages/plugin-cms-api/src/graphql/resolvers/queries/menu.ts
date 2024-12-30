import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const queries = {
  cmsMenuList: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { clientPortalId, kind } = args;

    const query: any = {
      clientPortalId,
    };

    if (kind) {
      query.kind = kind;
    }

    return models.MenuItems.find(query).sort({ order: 1 });
  },

  cmsMenu: async (_parent: any, args: any, context: IContext) => {
    const { models } = context;
    const { _id } = args;

    return models.MenuItems.findOne({ _id });
  },
};

export default queries;