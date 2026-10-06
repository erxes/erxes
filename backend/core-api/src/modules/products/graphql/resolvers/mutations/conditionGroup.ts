import { IProductConditionGroup } from '@/products/@types/conditionGroup';
import { IContext } from '~/connectionResolvers';

export const productConditionGroupMutations = {
  async productConditionGroupsAdd(
    _root: undefined,
    doc: IProductConditionGroup,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

    return models.ProductConditionGroups.createConditionGroup(doc);
  },

  async productConditionGroupsEdit(
    _root: undefined,
    { _id, ...doc }: IProductConditionGroup & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

    return models.ProductConditionGroups.updateConditionGroup(_id, doc);
  },

  async productConditionGroupsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsConfigsManage');

    return models.ProductConditionGroups.removeConditionGroups(_ids);
  },

  // Returns how many products got the group.
  async productCategorySetConditionGroup(
    _root: undefined,
    {
      categoryId,
      conditionGroupId,
    }: { categoryId: string; conditionGroupId?: string | null },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.ProductConditionGroups.setCategoryConditionGroup(
      categoryId,
      conditionGroupId || null,
    );
  },

  // Returns how many products got the group; deleted ones are left alone.
  async productsSetConditionGroup(
    _root: undefined,
    {
      productIds,
      conditionGroupId,
    }: { productIds: string[]; conditionGroupId?: string | null },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.ProductConditionGroups.setProductsConditionGroup(
      productIds,
      conditionGroupId || null,
    );
  },
};
