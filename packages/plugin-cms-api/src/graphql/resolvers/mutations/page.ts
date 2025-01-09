import {
    checkPermission,
    requireLogin,
  } from '@erxes/api-utils/src/permissions';
  
  import { IContext } from '../../../connectionResolver';
  
  const mutations = {

    /**
     * Cms page add
     */
    cmsPagesAdd: async (
      _parent: any,
      args: any,
      context: IContext
    ): Promise<any> => {
      const { models, user } = context;
      const { input } = args;
      input.createdUserId = user._id;

      return models.Pages.createPage(input);
    },
  
    /**
     * Cms page edit
     */
    cmsPagesEdit: async (
      _parent: any,
      args: any,
      context: IContext
    ): Promise<any> => {
      const { models } = context;
      const { _id, input } = args;
  
      return models.Pages.updatePage(_id, input);
    },

    /**
     * Cms page delete
     */
    cmsPagesRemove: async (
      _parent: any,
      args: any,
      context: IContext
    ): Promise<any> => {
      const { models } = context;
      const { _id } = args;

      return models.Pages.deleteOne({ _id });
    },
  };

  requireLogin(mutations, 'cmsPagesAdd');
  requireLogin(mutations, 'cmsPagesEdit');
  requireLogin(mutations, 'cmsPagesRemove');
  
  checkPermission(mutations, 'cmsPagesAdd', 'cmsPagesAdd', []);
  checkPermission(mutations, 'cmsPagesEdit', 'cmsPagesEdit', []);
  checkPermission(mutations, 'cmsPagesRemove', 'cmsPagesRemove', []);

  export default mutations