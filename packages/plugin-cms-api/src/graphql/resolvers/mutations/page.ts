import {
    checkPermission,
    requireLogin,
  } from '@erxes/api-utils/src/permissions';
  
  import { IContext } from '../../../connectionResolver';
  
  const mutations = {

    /**
     * Cms page add
     */
    pagesAdd: async (
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
    pagesEdit: async (
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
    pagesRemove: async (
      _parent: any,
      args: any,
      context: IContext
    ): Promise<any> => {
      const { models } = context;
      const { _id } = args;

      return models.Pages.deleteOne({ _id });
    },
  };

  export default mutations