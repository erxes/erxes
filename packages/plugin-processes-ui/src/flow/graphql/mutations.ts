import { mutations as productMutations } from '@erxes/ui-products/src/graphql';
import { flowFields } from './queries';

// FLOW

const flowParamsDef = `$name: String, $categoryId: String, $productId: String, $status: String, $jobs: [JobInput]`;
const flowParams = `name: $name, categoryId: $categoryId, productId: $productId, status: $status, jobs: $jobs`;

const flowsAdd = `
mutation flowsAdd(${flowParamsDef}) {
  flowsAdd(${flowParams}) {
    ${flowFields}
    jobs
  }
}
`;

const flowsEdit = `
mutation flowsEdit($id: String!, ${flowParamsDef} ) {
  flowsEdit(_id: $id, ${flowParams} ) {
    ${flowFields}
    jobs
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

const productsRemove = productMutations.productsRemove;
const productsConfigsUpdate = productMutations.productsConfigsUpdate;
const uomsEdit = productMutations.uomsEdit;
const uomsAdd = productMutations.uomsAdd;
const uomsRemove = productMutations.uomsRemove;
const productEdit = productMutations.productEdit;

export default {
  flowCategoriesAdd,
  flowCategoriesEdit,
  flowCategoriesRemove,

  flowsEdit,
  flowsAdd,
  flowsRemove,

  productsConfigsUpdate,
  productsRemove,
  productEdit,

  uomsEdit,
  uomsAdd,
  uomsRemove
};
