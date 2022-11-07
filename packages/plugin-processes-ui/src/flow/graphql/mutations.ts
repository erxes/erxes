import { flowFields } from './queries';

// FLOW

const flowParamsDef = `$name: String, $productId: String, $status: String, $isSub: Boolean, $jobs: [JobInput]`;
const flowParams = `name: $name, productId: $productId, status: $status, isSub: $isSub, jobs: $jobs`;

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
