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
query overallWorksSideBar($inBranchId: String, $inDepartmentId: String, $outBranchId: String, $outDepartmentId: String) {
  overallWorksSideBar(inBranchId: $inBranchId, inDepartmentId: $inDepartmentId, outBranchId: $outBranchId, outDepartmentId: $outDepartmentId) {
    _id
    intervalId
    interval
    job
  }
}`;

const overallWorksTotalCount = `
query overallWorksTotalCount($searchValue: String) {
  overallWorksTotalCount(searchValue: $searchValue)
}
`;

export default {
  works,
  worksTotalCount,
  overallWorks,
  overallWorksSideBar,
  overallWorksTotalCount
};
