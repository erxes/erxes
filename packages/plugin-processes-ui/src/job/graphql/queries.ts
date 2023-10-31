const jobRefersParamsDef = `
  $categoryId: String,
  $searchValue: String,
  $ids: [String],
  $types: [String],
`;
const jobRefersParams = `
  categoryId: $categoryId,
  searchValue: $searchValue,
  ids: $ids,
  types: $types,
`;

const jobRefersFields = `
  _id
  createdAt
  code
  name
  type
  status
  duration
  durationType
  categoryId
  needProducts
  resultProducts
`;

const jobCategoryFields = `
  _id
  createdAt
  name
  code
  order
  description
  parentId
  status
  productCount
`;

// JOB
const jobRefers = `
query jobRefers($page: Int, $perPage: Int, ${jobRefersParamsDef}) {
  jobRefers(page: $page, perPage: $perPage, ${jobRefersParams}) {
    ${jobRefersFields}
  }
}
`;

const jobReferTotalCount = `
query jobReferTotalCount(${jobRefersParamsDef}) {
  jobReferTotalCount(${jobRefersParams})
}
`;

const jobReferDetail = `
  query jobReferDetail($id: String!) {
  jobReferDetail(_id: $id) {
    ${jobRefersFields}
    needProductsData
    resultProductsData
  }
}
`;

const jobCategories = `
query jobCategories($status: String) {
  jobCategories(status: $status) {
      ${jobCategoryFields}
    }
  }
`;

const jobCategoriesTotalCount = `
  query jobCategoriesTotalCount {
    jobCategoriesTotalCount
  }
`;

export default {
  jobRefers,
  jobReferDetail,
  jobReferTotalCount,
  jobCategories,
  jobCategoriesTotalCount
};
