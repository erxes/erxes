const jobRefersParamsDef = `$page: Int, $perPage: Int, $categoryId: String, $searchValue: String`;
const jobRefersParams = `page: $page, perPage: $perPage, categoryId: $categoryId, searchValue: $searchValue`;

const jobRefersFields = `
_id
createdAt
code
name
type
status
duration
durationType
needProducts
resultProducts
      `;

const flowCategoryFields = `
      _id
      createdAt
      name
      code
      order
      description
      parentId
      status
      flowCount
      `;

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

const flowCategories = `
query flowCategories($status: String) {
  flowCategories(status: $status) {
      ${flowCategoryFields}
    }
  }
`;

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
