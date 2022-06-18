const list = `
  query posclientsQuery {
    posclients {
      _id
      name
    }
  }
`;

const totalCount = `
  query posclientsTotalCountQuery {
    posclientsTotalCount
  }
`;

export default {
  list,
  totalCount
};
