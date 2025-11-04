import { IContext } from '~/connectionResolvers';
import { IProductGroup } from '~/modules/ebarimt/@types';

export const productGroupMutations = {
  async ebarimtProductGroupCreate(
    _root: undefined,
    doc: IProductGroup,
    { models, user }: IContext,
  ) {
    return await models.ProductGroups.createProductGroup({
      ...doc,
      modifiedBy: user._id,
    });
  },

  async ebarimtProductGroupUpdate(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IProductGroup,
    { models, user }: IContext,
  ) {
    return await models.ProductGroups.updateProductGroup(_id, {
      ...doc,
      modifiedBy: user._id,
    });
  },
  async ebarimtProductGroupsRemove(
    _root: undefined,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    return await models.ProductGroups.removeProductGroups(ids);
  },
};
