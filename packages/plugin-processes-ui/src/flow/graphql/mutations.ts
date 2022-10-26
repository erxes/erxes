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

export default {
  flowsEdit,
  flowsAdd,
  flowsRemove
};
