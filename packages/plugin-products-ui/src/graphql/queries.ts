import { queries as productQueries } from '@erxes/ui-products/src/graphql';

const productCategories = productQueries.productCategories;

const products = productQueries.products;

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

const productsGroupCounts = `
  query productsGroupCounts(
    $segment: String,
    $segmentData: String,
    $only: String
  ) {
    productsGroupCounts(
      segment: $segment,
      segmentData: $segmentData,
      only: $only
    )
  }
`;

const productsCount = `
  query productsTotalCount(
    $type: String,
    $categoryId: String,
    $status: String,
    $tag: String,
    $searchValue: String,
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String
  ) {
    productsTotalCount(
      type: $type,
      status: $status,
      categoryId: $categoryId,
      tag: $tag,
      searchValue: $searchValue,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      segment: $segment,
      segmentData: $segmentData
    )
  }
`;

const productDetail = productQueries.productDetail;

const productCategoryDetail = `
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      code
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

// product documents
const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

export default {
  products,
  productDetail,
  productsCount,
  productsGroupCounts,
  productCountByTags,
  productCategories,
  productCategoriesCount,
  productCategoryDetail,
  uoms,
  uomsTotalCount,
  productsConfigs,
  documents
};
