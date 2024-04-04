const commonParams = `
  $searchValue: String
  $perPage: Int
  $page: Int
`;
const commonParamsDef = `
  searchValue: $searchValue
  perPage: $perPage
  page: $page
`;

const operations = `
query Operations(${commonParams}) {
  operations(${commonParamsDef}) {
    _id
    code
    order
    createdAt
    description
    modifiedAt
    name
    teamMemberIds
    parentId
  }
}
`;

const operationsTotalCount = `
    query OpeartionsTotalCount (${commonParams}) {
      operationsTotalCount(${commonParamsDef})
    }
`;

const operation = `
query Operation {
  operation {
    _id
    code
    createdAt
    description
    modifiedAt
    name
  }
}
`;

export default {
  operation,
  operations,
  operationsTotalCount
};
