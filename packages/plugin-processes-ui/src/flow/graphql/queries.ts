import { queries as productQueries } from '@erxes/ui-products/src/graphql';

const flowFields = `
_id
createdAt
createdBy
updatedAt
updatedBy
name
categoryId
status
jobs
`;

const flows = `
query flows {
  flows {
    ${flowFields}
  }
}
`;

const flowDetail = `
query flowDetail($_id: String!) {
  flowDetail(_id: $_id) {
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

const flowCategoriesTotalCount = `
  query flowCategoriesTotalCount {
    flowCategoriesTotalCount
  }
`;

export default {
  flowCategories,
  flowCategoriesTotalCount,

  flows,
  flowDetail,
  flowTotalCount
};
