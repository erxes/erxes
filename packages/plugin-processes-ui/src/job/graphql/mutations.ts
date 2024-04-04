// JOB

const jobRefersParamsDef = `$code: String, $name: String, $categoryId: String, $type: String, $status: String, $duration: Float, $durationType: String, $needProducts: [JobProductsInput], $resultProducts: [JobProductsInput]`;
const jobRefersParams = `code: $code, name: $name, categoryId: $categoryId, type: $type, status: $status, duration: $duration, durationType: $durationType, needProducts: $needProducts, resultProducts: $resultProducts`;

const jobCategoriesParamsDef = `$name: String!, $code: String!, $description: String, $parentId: String, $status: String`;
const jobCategoriesParams = `name: $name, code: $code, description: $description, parentId: $parentId, status: $status`;

const jobRefersAdd = `
mutation jobRefersAdd(${jobRefersParamsDef}) {
  jobRefersAdd(${jobRefersParams}) {
    _id
  }
}
`;

const jobRefersEdit = `
mutation jobRefersEdit($_id: String!, ${jobRefersParamsDef}) {
  jobRefersEdit(_id: $_id, ${jobRefersParams}) {
    _id
  }
}
`;

const jobRefersRemove = `
mutation jobRefersRemove($jobRefersIds: [String!]) {
  jobRefersRemove(jobRefersIds: $jobRefersIds)
}
`;

const jobCategoriesAdd = `
mutation jobCategoriesAdd(${jobCategoriesParamsDef}) {
  jobCategoriesAdd(${jobCategoriesParams}) {
    _id
  }
}
`;

const jobCategoriesEdit = `
mutation jobCategoriesEdit($_id: String!, ${jobCategoriesParamsDef}) {
  jobCategoriesEdit(_id: $_id, ${jobCategoriesParams}) {
    _id
  }
}
`;

const jobCategoriesRemove = `
mutation jobCategoriesRemove($_id: String!) {
  jobCategoriesRemove(_id: $_id)
}
`;

export default {
  jobRefersAdd,
  jobRefersEdit,
  jobRefersRemove,
  jobCategoriesAdd,
  jobCategoriesEdit,
  jobCategoriesRemove
};
