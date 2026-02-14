import { IBrand } from '@/organization/brand/types';
import { IContext } from '~/connectionResolvers';

export const brandMutations = {
  /**
   * Create new brand
   */
  async brandsAdd(_root: undefined, doc: IBrand, { user, models }: IContext) {
    return await models.Brands.createBrand({ userId: user._id, ...doc });
  },

  /**
   * Update brand
   */
  async brandsEdit(
    _root: undefined,
    { _id, ...fields }: { _id: string } & IBrand,
    { models }: IContext,
  ) {
    return await models.Brands.updateBrand(_id, fields);
  },

  /**
   * Delete brand
   * @throws {Error} If brands are not found or deletion fails
   */
  async brandsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    // Validate that brands exist before attempting deletion
    const brands = await models.Brands.find({ _id: { $in: _ids } });
    if (brands.length === 0) {
      throw new Error('No brands found to delete.');
    }

    // Attempt to remove brands
    try {
      const result = await models.Brands.removeBrands(_ids);
      
      if (result.deletedCount === 0) {
        throw new Error('No brands found to delete.');
      }

      return result;
    } catch (error: any) {
      // Re-throw with original message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete brands');
    }
  },
};
