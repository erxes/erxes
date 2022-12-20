export const workFields = `
  _id
  type
  typeId
  name
  status
  processId
  flowId
  flow
  inBranchId
  inDepartmentId
  outBranchId
  outDepartmentId
  startAt
  dueDate
  count
  origin
  interval
  intervalId
  needProducts
  resultProducts

  inDepartment {
    _id
    code
    title
    parentId
  }
  inBranch {
    _id
    code
    title,
    parentId
  }
  outDepartment {
    _id
    code
    title
    parentId
  }
  outBranch {
    _id
    code
    title,
    parentId
  }
`;

const paginateDefs = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const paginateParams = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
`;

const listParamsDef = `
  $search: String
  $type: String
  $startDate: Date
  $endDate: Date
  $inBranchId: String
  $outBranchId: String
  $inDepartmentId: String
  $outDepartmentId: String
  $productCategoryId: String
  $productId: String
  $jobCategoryId: String
  $jobReferId: String
`;

const listParamsValue = `
  search: $search
  type: $type
  startDate: $startDate
  endDate: $endDate
  inBranchId: $inBranchId
  outBranchId: $outBranchId
  inDepartmentId: $inDepartmentId
  outDepartmentId: $outDepartmentId
  productCategoryId: $productCategoryId
  productId: $productId
  jobCategoryId: $jobCategoryId
  jobReferId: $jobReferId
`;

const works = `
  query works(${listParamsDef}, ${paginateDefs}) {
    works(${listParamsValue}, ${paginateParams}) {
      ${workFields}
    }
  }
`;

const worksTotalCount = `
  query worksTotalCount(${listParamsDef}) {
    worksTotalCount(${listParamsValue})
  }
`;

export default {
  works,
  worksTotalCount
};
