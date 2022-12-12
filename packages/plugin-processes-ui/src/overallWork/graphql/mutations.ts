import { performFields } from './queries';

const addParamDefs = `
  $jobType: String,
  $jobReferId: String,
  $productId: String,

  $inBranchId: String,
  $inDepartmentId: String,
  $outBranchId: String,
  $outDepartmentId: String,
`;

const addParams = `
  jobType: $jobType,
  jobReferId: $jobReferId,
  productId: $productId,

  inBranchId: $inBranchId,
  inDepartmentId: $inDepartmentId,
  outBranchId: $outBranchId,
  outDepartmentId: $outDepartmentId,
`;

const commonParamDefs = `
  $count: Float,
  $startAt: Date,
  $endAt: Date,
  $status: String,

  $needProducts: JSON,
  $resultProducts: JSON,
`;

const commonParams = `
  count: $count,
  startAt: $startAt,
  endAt: $endAt,
  status: $status,

  needProducts: $needProducts,
  resultProducts: $resultProducts,
`;

const performAdd = `
  mutation performAdd(${addParamDefs}, ${commonParamDefs}) {
    performAdd(${addParams}, ${commonParams}) {
      ${performFields}
    }
  }
`;

const performEdit = `
  mutation performEdit($_id: String!, ${addParamDefs}, ${commonParamDefs}) {
    performEdit(_id: $_id, ${addParams}, ${commonParams}) {
      ${performFields}
    }
  }
`;

const performChange = `
  mutation performChange($_id: String!, ${commonParamDefs}) {
    performChange(_id: $_id, ${commonParams}) {
      ${performFields}
    }
  }
`;

const performRemove = `
  mutation performRemove($_id: String!) {
    performRemove(_id: $_id)
  }
`;

export default {
  performAdd,
  performEdit,
  performChange,
  performRemove
};
