import { branchCommonFields } from './queries';
const commonFields = `
  $name: String
  $description: String
  $erxesAppToken: String
  $user1Ids: [String]
  $user2Ids: [String]
  $paymentIds: [String]
  $paymentTypes: [JSON]
  $uiOptions: JSON
  $permissionConfig: JSON
`;

const commonVariables = `
  name: $name,
  description: $description,
  erxesAppToken: $erxesAppToken
  user1Ids: $user1Ids
  user2Ids: $user2Ids
  paymentIds: $paymentIds
  paymentTypes: $paymentTypes
  uiOptions: $uiOptions
  permissionConfig: $permissionConfig
`;

const bmsBranchAdd = `
  mutation bmsBranchAdd(${commonFields}) {
    bmsBranchAdd(${commonVariables}){
      ${branchCommonFields}
    }
  }
`;

const bmsBranchEdit = `
  mutation bmsBranchEdit($_id: String!, ${commonFields}) {
    bmsBranchEdit(_id: $_id, ${commonVariables}){
      ${branchCommonFields}
    }
  }
`;

const bmsBranchRemove = `
  mutation bmsBranchRemove($_id: String!) {
    bmsBranchRemove(_id: $_id)
  }
`;

export default {
  bmsBranchAdd,
  bmsBranchEdit,
  bmsBranchRemove,
};
