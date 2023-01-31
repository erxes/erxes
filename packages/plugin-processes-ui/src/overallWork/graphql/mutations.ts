import { performFields } from './queries';

const addParamDefs = `
  $overallWorkId: String
  $overallWorkKey: JSON
  $status: String
  $startAt: Date
  $dueDate: Date
  $endAt: Date
  $count: Float
  $description: String
  $appendix: String
  $assignedUserIds: [String]
  $customerId: String
  $companyId: String
  $inBranchId: String
  $inDepartmentId: String
  $outBranchId: String
  $outDepartmentId: String
  $needProducts: JSON
  $resultProducts: JSON
  $inProducts: JSON
  $outProducts: JSON
`;

const addParams = `
  overallWorkId: $overallWorkId
  overallWorkKey: $overallWorkKey
  status: $status
  startAt: $startAt
  dueDate: $dueDate
  endAt: $endAt
  count: $count
  description: $description
  appendix: $appendix
  assignedUserIds: $assignedUserIds
  customerId: $customerId
  companyId: $companyId
  inBranchId: $inBranchId
  inDepartmentId: $inDepartmentId
  outBranchId: $outBranchId
  outDepartmentId: $outDepartmentId
  needProducts: $needProducts
  resultProducts: $resultProducts
  inProducts: $inProducts
  outProducts: $outProducts
`;

const performAdd = `
  mutation performAdd(${addParamDefs}) {
    performAdd(${addParams}) {
      ${performFields}
    }
  }
`;

const performEdit = `
  mutation performEdit($_id: String!, ${addParamDefs}) {
    performEdit(_id: $_id, ${addParams}) {
      ${performFields}
    }
  }
`;

// const performChange = `
//   mutation performChange($_id: String!, ${commonParamDefs}) {
//     performChange(_id: $_id, ${commonParams}) {
//       ${performFields}
//     }
//   }
// `;

const performRemove = `
  mutation performRemove($_id: String!) {
    performRemove(_id: $_id)
  }
`;

export default {
  performAdd,
  performEdit,
  // performChange,
  performRemove
};
