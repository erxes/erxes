import { IContext } from '~/connectionResolvers';
import { IProductGroup } from '~/modules/ebarimt/@types';

export const productGroupMutations = {
  async ebarimtProductGroupCreate(
    _root: undefined,
    doc: IProductGroup,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('ebarimt:productGroupCreate');
    return await models.ProductGroups.createProductGroup({
      ...doc,
      modifiedBy: user._id,
    });
  },

  async ebarimtProductGroupUpdate(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IProductGroup,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('ebarimt:productGroupUpdate');
    return await models.ProductGroups.updateProductGroup(_id, {
      ...doc,
      modifiedBy: user._id,
    });
  },

  async ebarimtProductGroupsRemove(
    _root: undefined,
    { ids }: { ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('ebarimt:productGroupsRemove');
    return await models.ProductGroups.removeProductGroups(ids);
  },
};