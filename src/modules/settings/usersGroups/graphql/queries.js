const usersGroups = `
  query usersGroups($page: Int, $perPage: Int) {
    usersGroups(page: $page, perPage: $perPage) {
      _id
      name
      description
    }
  }
`;

const totalCount = `
  query usersGroupsTotalCount {
    usersGroupsTotalCount
  }
`;

export default { usersGroups, totalCount };
