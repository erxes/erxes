import { IProductRule } from '@/products/@types/rule';
import { difference } from 'lodash';

const cleanDuplicates = (inc: string[] = [], exc: string[] = []) => {
  return {
    includes: difference(inc, exc),
    excludes: difference(exc, inc),
  };
};

export const prepareDoc = (doc: IProductRule): IProductRule => {
  const categories = cleanDuplicates(doc.categoryIds, doc.excludeCategoryIds);
  const products = cleanDuplicates(doc.productIds, doc.excludeProductIds);
  const tags = cleanDuplicates(doc.tagIds, doc.excludeTagIds);

  return {
    ...doc,
    categoryIds: categories.includes,
    excludeCategoryIds: categories.excludes,
    productIds: products.includes,
    excludeProductIds: products.excludes,
    tagIds: tags.includes,
    excludeTagIds: tags.excludes,
  };
};
