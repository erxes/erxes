// FLOW

const flowParamsDef = `$name: String, $categoryId: String, $status: String, $jobs: [JobInput]`;
const flowParams = `name: $name, categoryId: $categoryId, status: $status, jobs: $jobs`;

const flowsAdd = `
mutation flowsAdd(${flowParamsDef}) {
  flowsAdd(${flowParams}) {
    _id
  }
}
`;

const flowsEdit = `
mutation flowsEdit($id: String!, ${flowParamsDef} ) {
  flowsEdit(_id: $id, ${flowParams} ) {
    _id
  }
}
`;

const flowsRemove = `
mutation flowsRemove($flowIds: [String!]) {
  flowsRemove(flowIds: $flowIds)
}
`;

const flowCategoriesParamsDef = `$name: String!, $code: String!, $description: String, $parentId: String, $status: String`;
const flowCategoriesParams = `name: $name, code: $code, description: $description, parentId: $parentId, status: $status`;

const flowCategoriesAdd = `
mutation flowCategoriesAdd(${flowCategoriesParamsDef}) {
  flowCategoriesAdd(${flowCategoriesParams}) {
    _id
  }
}
`;

const flowCategoriesEdit = `
mutation flowCategoriesEdit($_id: String!, ${flowCategoriesParamsDef}) {
  flowCategoriesEdit(_id: $_id, ${flowCategoriesParams}) {
    _id
  }
}
`;

const flowCategoriesRemove = `
mutation flowCategoriesRemove($_id: String!) {
  flowCategoriesRemove(_id: $_id)
}
`;

export default {
  flowCategoriesAdd,
  flowCategoriesEdit,
  flowCategoriesRemove,

  flowsEdit,
  flowsAdd,
  flowsRemove
};
