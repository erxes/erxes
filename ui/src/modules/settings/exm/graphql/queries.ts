const exms = `
  query exms($page: Int, $perPage: Int) {
    exms(page: $page, perPage: $perPage) {
      list {
        _id
        name
        createdAt
      }
      totalCount
    }
  }
`;

const exmDetail = `
  query exmDetail($_id: String!) {
    exmDetail(_id: $_id) {
      _id
      name
      createdAt
    }
  }
`;

const exmGetLast = `
  query exmGetLast {
    exmGetLast {
      _id
      name
      createdAt
    }
  }
`;

export default { exms, exmDetail, exmGetLast };
