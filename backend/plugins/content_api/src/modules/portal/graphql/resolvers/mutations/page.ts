import { IContext } from '~/connectionResolvers';
import { BaseMutationResolver } from '@/portal/utils/base-resolvers';
import { PermissionManager } from '@/portal/utils/permission-utils';

class PageMutationResolver extends BaseMutationResolver {
  /**
   * Cms page add
   */
  async cmsPagesAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { user } = context;
    const { input } = args;
    input.createdUserId = user._id;

    return this.create(this.models.Pages, input, user._id);
  }

  /**
   * Cms page edit
   */
  async cmsPagesEdit(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id, input } = args;
    return this.models.Pages.updatePage(_id, input);
  }

  /**
   * Cms page delete
   */
  async cmsPagesRemove(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id } = args;
    return this.remove(this.models.Pages, _id);
  }
}

const mutations = {
  cmsPagesAdd: (_parent: any, args: any, context: IContext) =>
    new PageMutationResolver(context).cmsPagesAdd(_parent, args, context),
  cmsPagesEdit: (_parent: any, args: any, context: IContext) =>
    new PageMutationResolver(context).cmsPagesEdit(_parent, args, context),
  cmsPagesRemove: (_parent: any, args: any, context: IContext) =>
    new PageMutationResolver(context).cmsPagesRemove(_parent, args, context),
};

PermissionManager.applyCmsPermissions(mutations);

export default mutations;
