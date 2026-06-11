import { IProductSimilarityBulkInput } from '@/products/@types/similarity';
import { IContext } from '~/connectionResolvers';

export const productSimilarityMutations = {
  async productSimilarityBulkSave(
    _root: undefined,
    { _id, doc }: { _id?: string; doc: IProductSimilarityBulkInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    return models.ProductSimilarities.bulkSaveSimilarity({ ...doc, _id }, user);
  },

  async productSimilarityRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsDelete');

    return models.ProductSimilarities.removeSimilarity(_id);
  },

  async productSimilaritySetStar(
    _root: undefined,
    { _id, productId }: { _id: string; productId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.ProductSimilarities.setStar(_id, productId);
  },
};
