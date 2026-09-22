import { IProductSimilarityBulkInput } from '@/products/@types/similarity';
import { IContext } from '~/connectionResolvers';

export const productSimilarityMutations = {
  async productBulkSimilarityAdd(
    _root: undefined,
    { doc }: { doc: IProductSimilarityBulkInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('productsCreate');

    return models.ProductSimilarities.addSimilarity(doc, user);
  },

  async productBulkSimilarityEdit(
    _root: undefined,
    { _id, doc }: { _id: string; doc: IProductSimilarityBulkInput },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('productsUpdate');

    return models.ProductSimilarities.editSimilarity(_id, doc, user);
  },

  async productBulkSimilarityRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('productsDelete');

    return models.ProductSimilarities.removeSimilarity(_id);
  },
};
