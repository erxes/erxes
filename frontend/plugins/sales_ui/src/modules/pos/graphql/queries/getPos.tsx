import gql from 'graphql-tag';
export const posCommonFields = `
  _id
  name
  description
  orderPassword
  scopeBrandIds
  pdomain
  createdAt
  token
  erxesAppToken
  adminIds
  cashierIds
  paymentIds
  paymentTypes
  user {
    _id
    details {
      avatar
      fullName
    }
  }

  isOnline
  onServer
  branchId
  departmentId
  allowBranchIds
  beginNumber
  maxSkipNumber
  waitingScreen
  kitchenScreen
  kioskMachine
  uiOptions
  ebarimtConfig
  erkhetConfig
  cardsConfig
  catProdMappings {
    _id
    categoryId
    code
    name
    productId
  }

  initialCategoryIds
  kioskExcludeCategoryIds
  kioskExcludeProductIds
  deliveryConfig
  checkRemainder
  permissionConfig
  allowTypes
  isCheckRemainder
  checkExcludeCategoryIds
  banFractions

  branchTitle
  departmentTitle
`;
// export const GET_POS = gql`
//   query getPos(
//     $name: String
//     $userId: String
//     $teamIds: [String]
//     $projectId: String
//   ) {
//     getPos(
//       name: $name
//       userId: $userId
//       teamIds: $teamIds
//       projectId: $projectId
//     ) {
//       _id
//       name
//       isOnline
//       onServer
//       branchTitle
//       departmentTitle
//       createdAt
//       updatedAt
//       user {
//         _id
//         details {
//           avatar
//           fullName
//         }
//       }
//     }
//   }
  
// `;
const commonParamDefs = `
  $page: Int,
  $perPage: Int
`;
const commonParams = `
  page: $page,
  perPage: $perPage
`;
export const POS_LIST = gql`
query posList(
  ${commonParamDefs}
  $sortField: String
  $sortDirection: Int
) {
  posList(
    ${commonParams}
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    ${posCommonFields}
  }
}
`;
