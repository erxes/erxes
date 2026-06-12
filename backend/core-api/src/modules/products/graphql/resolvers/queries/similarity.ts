import { escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IProductSimilarityDocument } from '@/products/@types/similarity';
import { PRODUCT_SIMILARITY_STATUSES } from '@/products/constants';
import { IContext } from '~/connectionResolvers';

const generateFilter = (searchValue?: string) => {
  const filter: FilterQuery<IProductSimilarityDocument> = {
    status: { $ne: PRODUCT_SIMILARITY_STATUSES.DELETED },
  };

  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    filter.$or = [{ 'info.code': regex }, { 'info.name': regex }];
  }

  return filter;
};

export const productSimilarityQueries = {
  async productBulkSimilarity(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ProductSimilarities.getSimilarity(_id);
  },

  async productBulkSimilarities(
    _root: undefined,
    {
      page = 1,
      perPage = 20,
      searchValue,
    }: { page?: number; perPage?: number; searchValue?: string },
    { models }: IContext,
  ) {
    const filter = generateFilter(searchValue);

    return models.ProductSimilarities.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
  },

  async productBulkSimilaritiesTotalCount(
    _root: undefined,
    { searchValue }: { searchValue?: string },
    { models }: IContext,
  ) {
    return models.ProductSimilarities.countDocuments(
      generateFilter(searchValue),
    );
  },
};
