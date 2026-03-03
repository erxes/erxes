import { IContext } from '~/connectionResolvers';
import { requireLogin } from 'erxes-api-shared/core-modules';

const mutations = {
  async cmsPagesAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { user, models } = context;
    const { input } = args;
    input.createdUserId = user._id;

    return models.Pages.create(input);
  },

  /**
   * Cms page edit
   */
  async cmsPagesEdit(
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> {
    const { _id, input } = args;
    return models.Pages.updatePage(_id, input);
  },

  /**
   * Cms page delete
   */
  async cmsPagesRemove(
    _parent: any,
    args: any,
    { models }: IContext,
  ): Promise<any> {
    const { _id } = args;
    return models.Pages.deleteOne({ _id });
  },
};

requireLogin(mutations, 'cmsPagesAdd');
requireLogin(mutations, 'cmsPagesEdit');
requireLogin(mutations, 'cmsPagesRemove');

export default mutations;
