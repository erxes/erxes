import { queries as productQueries } from '@erxes/ui-products/src/graphql';

const productFields = productQueries.productFields;

const productCategories = productQueries.productCategories;

const products = productQueries.products;

const listParamsDef = `
    $type: String,
    $categoryId: String,
    $tag: String,
    $searchValue: String,
    $perPage: Int,
    $page: Int, 
    $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String
`;

const listParamsValue = `
    type: $type,
    categoryId: $categoryId,
    tag: $tag,
    searchValue: $searchValue,
    perPage: $perPage,
    page: $page, 
    ids: $ids,
    excludeIds: $excludeIds,
    pipelineId: $pipelineId,
    boardId: $boardId,
    segment: $segment,
    segmentData: $segmentData 
`;

const productsCount = `
  query productsTotalCount($type: String) {
    productsTotalCount(type: $type)
  }
`;

const segmentProductsCounts = `
  query productCounts(${listParamsDef}, $only: String) {
    productCounts(${listParamsValue}, only: $only)
  }
`;

const productCountByTags = `
  query productCountByTags {
    productCountByTags
  }
`;

const productCategoriesCount = `
  query productCategoriesTotalCount {
    productCategoriesTotalCount
  }
`;

const productDetail = productQueries.productDetail;

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      name
      productCount
    }
  }
`;

// UOM

const uoms = productQueries.uoms;

const uomsTotalCount = productQueries.uomsTotalCount;

// Settings

const productsConfigs = productQueries.productsConfigs;

export default {
  products,
  productDetail,
  productCountByTags,
  productsCount,
  productCategories,
  productCategoriesCount,
  productCategoryDetail,
  uoms,
  uomsTotalCount,
  productsConfigs,
  segmentProductsCounts
};
