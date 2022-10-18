import { queries as productQueries } from '@erxes/ui-products/src/graphql';

const flowFields = `
  _id
  createdAt
  createdBy
  updatedAt
  updatedBy
  name
  categoryId
  productId
  product
  status
  flowJobStatus
`;

const flows = `
query flows($categoryId: String, $searchValue: String) {
  flows(categoryId: $categoryId, searchValue: $searchValue) {
    ${flowFields}
  }
}
`;

const flowsAll = `
query flowsAll {
  flowsAll {
    ${flowFields}
  }
}
`;

const flowDetail = `
query flowDetail($_id: String!) {
  flowDetail(_id: $_id) {
    ${flowFields}
    jobs
  }
}
`;

const flowTotalCount = `
query flowTotalCount($categoryId: String, $searchValue: String) {
  flowTotalCount(categoryId: $categoryId, searchValue: $searchValue)
}
`;

const flowCategories = productQueries.productCategories;
const uoms = productQueries.uoms;
const uomsTotalCount = productQueries.uomsTotalCount;

const productsConfigs = productQueries.productsConfigs;
const productDetail = productQueries.productDetail;

const flowCategoriesTotalCount = `
  query flowCategoriesTotalCount {
    flowCategoriesTotalCount
  }
`;

export default {
  flowCategories,
  flowCategoriesTotalCount,

  flows,
  flowsAll,
  flowDetail,
  flowTotalCount,

  uoms,
  productsConfigs,
  productDetail,
  uomsTotalCount
};
