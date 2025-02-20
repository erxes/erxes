import { branchCommonFields } from "./queries";
const commonFields = `
  $name: String
  $description: String
  $erxesAppToken: String
  $user1Ids: [String]
  $user2Ids: [String]
  $user3Ids: [String]
  $user4Ids: [String]
  $user5Ids: [String]

  $paymentIds: [String]
  $paymentTypes: [JSON]
  $uiOptions: JSON
  $permissionConfig: JSON
  $pipelineConfig: JSON
  $extraProductCategories: JSON
  $roomCategories: JSON
  $discount: JSON
  $time: String
`;

const commonVariables = `
  name: $name,
  description: $description,
  erxesAppToken: $erxesAppToken
  user1Ids: $user1Ids
  user2Ids: $user2Ids
  user3Ids: $user3Ids
  user4Ids: $user4Ids
  user5Ids: $user5Ids

  paymentIds: $paymentIds
  paymentTypes: $paymentTypes
  uiOptions: $uiOptions
  permissionConfig: $permissionConfig
  pipelineConfig: $pipelineConfig
  extraProductCategories: $extraProductCategories
  roomCategories: $roomCategories
  discount: $discount
  time: $time
`;

const tmsBranchAdd = `
  mutation pmsBranchAdd(${commonFields}) {
    pmsBranchAdd(${commonVariables}){
      ${branchCommonFields}
    }
  }
`;

const tmsBranchEdit = `
  mutation pmsBranchEdit($_id: String!, ${commonFields}) {
    pmsBranchEdit(_id: $_id, ${commonVariables}){
      ${branchCommonFields}
    }
  }
`;

const tmsBranchRemove = `
  mutation tmsBranchRemove($_id: String!) {
    tmsBranchRemove(_id: $_id)
  }
`;

export default {
  tmsBranchAdd,
  tmsBranchEdit,
  tmsBranchRemove
};
