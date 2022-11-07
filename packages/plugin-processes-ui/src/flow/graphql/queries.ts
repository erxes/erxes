export const flowFields = `
  _id
  createdAt
  createdBy
  updatedAt
  updatedBy
  name
  productId
  product
  status
  isSub
  flowValidation
  jobCount
  latestBranchId
  latestDepartmentId
`;

const flowsQueryDefs = `
  $ids: [String]
  $isSub: Boolean
  $categoryId: String,
  $searchValue: String,
  $branchId: String,
  $departmentId: String,
  $status: String,
  $validation: String,
`;

const flowsQueryParams = `
  ids: $ids,
  isSub: $isSub,
  categoryId: $categoryId,
  searchValue: $searchValue,
  branchId: $branchId,
  departmentId: $departmentId,
  status: $status,
  validation: $validation,
`;

const flows = `
  query flows($page: Int, $perPage: Int, ${flowsQueryDefs}) {
    flows(page: $page, perPage: $perPage, ${flowsQueryParams}) {
      ${flowFields}
    }
  }
`;

const flowsMain = `
  query flows($page: Int, $perPage: Int, ${flowsQueryDefs}) {
    flows(page: $page, perPage: $perPage, ${flowsQueryParams}) {
      ${flowFields}
      latestBranch
      latestDepartment
    }
  }
`;

const subFlows = `
  query flows($page: Int, $perPage: Int, ${flowsQueryDefs}) {
    flows(page: $page, perPage: $perPage, ${flowsQueryParams}) {
      ${flowFields}
      latestNeedProducts
      latestResultProducts
      latestBranch
      latestDepartment
    }
  }
`;

const flowsAll = `
query flowsAll {
  flowsAll {
    ${flowFields}
  }
}
`;

const flowDetail = `
query flowDetail($_id: String!) {
  flowDetail(_id: $_id) {
    ${flowFields}
    jobs

    latestBranchId
    latestDepartmentId
    latestBranch
    latestDepartment
    latestNeedProducts
    latestResultProducts
  }
}
`;

const flowTotalCount = `
query flowTotalCount(${flowsQueryDefs}) {
  flowTotalCount(${flowsQueryParams})
}
`;

const flowCategories = `
  query flowCategories($status: String) {
    flowCategories(status: $status) {
      _id
      name
      order
      code
      parentId
      description
      status

      isRoot
      flowCount
    }
  }
`;

const flowCategoriesTotalCount = `
  query flowCategoriesTotalCount {
    flowCategoriesTotalCount
  }
`;

export default {
  flowCategories,
  flowCategoriesTotalCount,

  flows,
  flowsMain,
  subFlows,
  flowsAll,
  flowDetail,
  flowTotalCount
};
