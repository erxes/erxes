import { workFields } from './queries';

const addParamDefs = `
  $name: String
  $status: String
  $dueDate: Date
  $startAt: Date
  $endAt: Date
  $type: String
  $typeId: String
  $count: Float
  $inBranchId: String
  $inDepartmentId: String
  $outBranchId: String
  $outDepartmentId: String
  $needProducts: JSON
  $resultProducts: JSON
`;

const addParams = `
  name: $name
  status: $status
  dueDate: $dueDate
  startAt: $startAt
  endAt: $endAt
  type: $type
  typeId: $typeId
  count: $count
  inBranchId: $inBranchId
  inDepartmentId: $inDepartmentId
  outBranchId: $outBranchId
  outDepartmentId: $outDepartmentId
  needProducts: $needProducts
  resultProducts: $resultProducts
`;

const workAdd = `
  mutation workAdd(${addParamDefs}) {
    workAdd(${addParams}) {
      ${workFields}
    }
  }
`;

const workEdit = `
  mutation workEdit($_id: String!, ${addParamDefs}) {
    workEdit(_id: $_id, ${addParams}) {
      ${workFields}
    }
  }
`;

const workRemove = `
  mutation workRemove($_id: String!) {
    workRemove(_id: $_id)
  }
`;

export default {
  workAdd,
  workEdit,
  workRemove
};
