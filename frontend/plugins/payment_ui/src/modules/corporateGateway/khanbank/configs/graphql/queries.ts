const listQuery = `
query KhanbankConfigsList($page: Int, $perPage: Int) {
    khanbankConfigsList(page: $page, perPage: $perPage) {
      list {
        _id
        consumerKey
        secretKey
        description
        name
      }
      totalCount
    }
  }
`;

export default {
  listQuery
};
