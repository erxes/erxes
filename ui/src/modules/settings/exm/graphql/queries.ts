const commonField = `
  _id
  name
  createdAt
`;

const exms = `
  query exms($page: Int, $perPage: Int) {
    exms(page: $page, perPage: $perPage) {
      list {
        ${commonField}
      }
      totalCount
    }
  }
`;

const exmDetail = `
  query exmDetail($_id: String!) {
    exmDetail(_id: $_id) {
      ${commonField}
      features
    }
  }
`;

const exmGetLast = `
  query exmGetLast {
    exmGetLast {
      ${commonField}
      features
    }
  }
`;

export default { exms, exmDetail, exmGetLast };
