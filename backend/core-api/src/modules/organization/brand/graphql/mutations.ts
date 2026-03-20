import { IBrand } from '@/organization/brand/types';
import { IContext } from '~/connectionResolvers';

export const brandMutations = {
  /**
   * Create new brand
   */
  async brandsAdd(
    _root: undefined,
    doc: IBrand,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('brandsCreate');

    return await models.Brands.createBrand({ userId: user._id, ...doc });
  },

  /**
   * Update brand
   */
  async brandsEdit(
    _root: undefined,
    { _id, ...fields }: { _id: string } & IBrand,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('brandsUpdate');

    return await models.Brands.updateBrand(_id, fields);
  },

  /**
   * Delete brand
   */
  async brandsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('brandsDelete');

    return await models.Brands.removeBrands(_ids);
  },
};
