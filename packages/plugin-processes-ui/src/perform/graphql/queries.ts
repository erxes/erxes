import { queries as productQueries } from '@erxes/ui-products/src/graphql';

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

export default {
  works,
  worksTotalCount
};
