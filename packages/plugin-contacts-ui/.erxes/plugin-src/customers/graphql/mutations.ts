import { mutations as customerMutations } from '@erxes/ui/src/customers/graphql';

const customersAdd = customerMutations.customersAdd;

const customersEdit = customerMutations.customersEdit;

const customersRemove = customerMutations.customersRemove;

const customersMerge = customerMutations.customersMerge;

const customersChangeState = customerMutations.customersChangeState;

const customersVerify = `
  mutation customersVerify($verificationType: String!) {
    customersVerify(verificationType: $verificationType)
  }
`;

const customersChangeVerificationStatus = `
mutation customersChangeVerificationStatus($customerIds: [String],$type: String!, $status: String!){
  customersChangeVerificationStatus(customerIds:$customerIds,type:$type,status:$status){
    _id
  }
}
`;

export default {
  customersAdd,
  customersEdit,
  customersRemove,
  customersChangeState,
  customersMerge,
  customersVerify,
  customersChangeVerificationStatus
};
