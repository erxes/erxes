import { IContext } from '~/connectionResolvers';
import { BaseMutationResolver } from '@/portal/utils/base-resolvers';
import { PermissionManager } from '@/portal/utils/permission-utils';

class CategoryMutationResolver extends BaseMutationResolver {
  /**
   * Cms category add
   */
  async cmsCategoriesAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { input } = args;
    return this.create(this.models.Categories, input);
  }

  /**
   * Cms category edit
   */
  async cmsCategoriesEdit(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id, input } = args;
    return this.models.Categories.updateCategory(_id, input);
  }

  /**
   * Cms category remove
   */
  async cmsCategoriesRemove(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id } = args;
    return this.remove(this.models.Categories, _id);
  }

  /**
   * Cms category toggle status
   */
  async cmsCategoriesToggleStatus(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id } = args;
    return this.models.Categories.toggleStatus(_id);
  }
}

const resolver = new CategoryMutationResolver({} as IContext);
const mutations = {
  cmsCategoriesAdd: resolver.cmsCategoriesAdd.bind(resolver),
  cmsCategoriesEdit: resolver.cmsCategoriesEdit.bind(resolver),
  cmsCategoriesRemove: resolver.cmsCategoriesRemove.bind(resolver),
  cmsCategoriesToggleStatus: resolver.cmsCategoriesToggleStatus.bind(resolver),
};

PermissionManager.applyCmsPermissions(mutations);

export default mutations;
