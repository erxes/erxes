const list = `
  query {name}sQuery {
    {name}s {
      _id
      name
    }
  }
`;

const totalCount = `
  query {name}sTotalCountQuery {
    {name}sTotalCount
  }
`;

export default {
  list,
  totalCount
};
