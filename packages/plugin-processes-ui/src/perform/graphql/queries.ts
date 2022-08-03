const workFields = `
_id
name
    status
    jobId
    job
    flow
    product
    inBranch
    inDepartment
    outBranch
    outDepartment
    startAt
    count
    interval
    intervalId
    needProducts
    resultProducts
      `;

const works = `
query works($page: Int, $perPage: Int, $searchValue: String) {
  works(page: $page, perPage: $perPage, searchValue: $searchValue) {
    ${workFields}
  }
}
`;

const worksTotalCount = `
  query worksTotalCount($searchValue: String) {
    worksTotalCount(searchValue: $searchValue)
  }
`;

const overallWorkFields = `_id
status
startAt
job
flow
interval
intervalId
outBranch
outDepartment
inBranch
inDepartment
needProducts
resultProducts`;

const overallWorks = `
query overallWorks($page: Int, $perPage: Int, $searchValue: String) {
  overallWorks(page: $page, perPage: $perPage, searchValue: $searchValue) {
    ${overallWorkFields}
  }
}`;

const overallWorksSideBar = `
query overallWorksSideBar($inBranchId: String, $inDepartmentId: String, $outBranchId: String, $outDepartmentId: String,$jobReferId: String) {
  overallWorksSideBar(inBranchId: $inBranchId, inDepartmentId: $inDepartmentId, outBranchId: $outBranchId, outDepartmentId: $outDepartmentId,jobReferId: $jobReferId) {
    _id
    intervalId
    interval
    job
  }
}`;

const sideBarDetailFields = `
_id
    job
    jobId
    flow
    flowId
    interval
    intervalId
    outBranch
    outDepartment
    inBranch
    inDepartment
    needProductsDetail
    needProducts
    resultProductsDetail
    resultProducts

`;

const overallWorksSideBarDetail = `
query OverallWorksSideBarDetail($id: String) {
  overallWorksSideBarDetail(id: $id) {
    ${sideBarDetailFields}
  }
}
`;

const overallWorksTotalCount = `
query overallWorksTotalCount($searchValue: String) {
  overallWorksTotalCount(searchValue: $searchValue)
}
`;

const performFields = `
    _id
    needProducts
    resultProducts
    productId
    count
    status
    overallWorkId
    overallWork
    startAt`;

const performs = `
query performs {
  performs {
   ${performFields}
  }
}
`;

const performsByOverallWorkId = `
query performsByOverallWorkId($overallWorkId: String) {
  performsByOverallWorkId(overallWorkId: $overallWorkId) {
    ${performFields}
  }
}
`;

const performsTotalCount = `
query performsTotalCount {
  performsTotalCount
}
`;

const performsByOverallWorkIdTotalCount = `
  query performsByOverallWorkIdTotalCount($overallWorkId: String) {
    performsByOverallWorkIdTotalCount(overallWorkId: $overallWorkId)
  }
`;

const allProducts = `
query allProducts {
  allProducts
}
`;

export default {
  works,
  worksTotalCount,
  overallWorks,
  overallWorksSideBar,
  overallWorksSideBarDetail,
  overallWorksTotalCount,
  performs,
  performsByOverallWorkId,
  performsTotalCount,
  performsByOverallWorkIdTotalCount,
  allProducts
};
