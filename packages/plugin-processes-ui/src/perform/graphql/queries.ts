const workFields = `
  _id
  name
  status
  flow
  inBranchId
  inDepartmentId
  outBranchId
  outDepartmentId
  startAt
  dueDate
  count
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

export default {
  works,
  worksTotalCount
};
