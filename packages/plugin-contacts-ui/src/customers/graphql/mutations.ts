import { mutations as customerMutations } from 'erxes-ui/lib/customers/graphql';

const customersAdd = customerMutations.customersAdd;

const customersEdit = customerMutations.customersEdit;

const customersRemove = `
  mutation customersRemove($customerIds: [String]) {
    customersRemove(customerIds: $customerIds)
  }
`;

const customersMerge = `
  mutation customersMerge($customerIds: [String], $customerFields: JSON) {
    customersMerge(customerIds: $customerIds, customerFields: $customerFields) {
      _id
    }
  }
`;

const customersChangeState = `
  mutation customersChangeState($_id: String!, $value: String!) {
    customersChangeState(_id: $_id, value: $value) {
      _id
    }
  }
`;

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
