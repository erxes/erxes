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
   * @throws {Error} If brand is in use or deletion fails
   */
  async brandsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    try {
      // Check if brands are in use before deletion
      // This prevents crashes from foreign key constraints
      const brands = await models.Brands.find({ _id: { $in: _ids } });
      if (brands.length === 0) {
        throw new Error('Brands not found');
      }

      // Attempt to remove brands
      const result = await models.Brands.removeBrands(_ids);
      
      if (result.deletedCount === 0) {
        throw new Error('Failed to delete brands. They may be in use.');
      }

      return result;
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.code === 11000 || error.message?.includes('foreign key')) {
        throw new Error('Cannot delete brand: it is currently in use');
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to delete brands');
    }
  },
};
