import { checkPermission } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../connectionResolver';

const exmQueries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  async exms(_root, args: any, { models }: IContext) {
    return {
      list: await models.Exms.find(args).sort({ createdAt: -1 }),
      totalCount: await models.Exms.countDocuments()
    };
  },

  async exmGet(_root, _args, { models }) {
    return models.Exms.findOne().sort({ createdAt: -1 });
  },

  async exmCoreCategories(_root, params: any, { models }: IContext) {
    return models.ExmCategories.find();
  },
  async exmCoreCategoriesTotalCount(_root, params: any, { models }: IContext) {
    return await models.ExmCategories.countDocuments();
  }
};

checkPermission(exmQueries, 'exms', 'showExms', []);
checkPermission(exmQueries, 'exmGet', 'showExms', []);

export default exmQueries;
