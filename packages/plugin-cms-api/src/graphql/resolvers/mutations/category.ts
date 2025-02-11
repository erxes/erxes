import {
  checkPermission,
  requireLogin,
} from '@erxes/api-utils/src/permissions';

import { IContext } from '../../../connectionResolver';

const mutations = {
  /**
   * Cms category add
   */
  cmsCategoriesAdd: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models, clientPortalId } = context;
    const { input } = args;

    if (clientPortalId) {
      input.clientPortalId = clientPortalId;
    }

    return models.Categories.createCategory(input);
  },

  /**
   * Cms category edit
   */
  cmsCategoriesEdit: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models, clientPortalId } = context;
    const { _id, input } = args;

    if (clientPortalId) {
      input.clientPortalId = clientPortalId;
    }

    return models.Categories.updateCategory(_id, input);
  },

  /**
   * Cms category remove
   */
  cmsCategoriesRemove: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Categories.deleteOne({ _id });
  },

  /**
   * Cms category toggle status
   */
  cmsCategoriesToggleStatus: async (
    _parent: any,
    args: any,
    context: IContext
  ): Promise<any> => {
    const { models } = context;
    const { _id } = args;

    return models.Categories.toggleStatus(_id);
  },
};

requireLogin(mutations, 'cmsCategoriesAdd');
requireLogin(mutations, 'cmsCategoriesEdit');
requireLogin(mutations, 'cmsCategoriesRemove');
requireLogin(mutations, 'cmsCategoriesToggleStatus');

checkPermission(mutations, 'cmsCategoriesAdd', 'cmsCategoriesAdd', []);
checkPermission(mutations, 'cmsCategoriesEdit', 'cmsCategoriesEdit', []);
checkPermission(mutations, 'cmsCategoriesRemove', 'cmsCategoriesRemove', []);
checkPermission(
  mutations,
  'cmsCategoriesToggleStatus',
  'cmsCategoriesEdit',
  []
);

export default mutations;
