const list = `
  query tradingsQuery {
    tradings {
      _id
      name
    }
  }
`;

const totalCount = `
  query tradingsTotalCountQuery {
    tradingsTotalCount
  }
`;

export default {
  list,
  totalCount
};
