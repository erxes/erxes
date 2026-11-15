import { IProductSimilarity } from '../types';

// A similarity group in the side panel:
// `?panel=/detail/core:productSimilarity/<id>`.
export const SIMILARITY_CONTENT_TYPE = 'core:productSimilarity';

// Legacy `?similarityId=` links redirect to the side panel.
export const SIMILARITY_QUERY_KEY = 'similarityId';

// What a new group's draft starts with, e.g. the product it is made from.
export type TSimilarityDraftDefaults = { similarity?: IProductSimilarity };

// What a group's create, edit or delete changes besides the group: the list
// and its count, and the products it makes, updates or lets go (the product
// panel and the product list).
export const SIMILARITY_CHANGE_REFETCH_QUERIES = [
  'ProductSimilarities',
  'ProductSimilaritiesTotalCount',
  'PRODUCT_DETAIL_QUERY',
  'ProductsMain',
];
