const list = `
  query clientpossQuery {
    clientposs {
      _id
      name
    }
  }
`;

const totalCount = `
  query clientpossTotalCountQuery {
    clientpossTotalCount
  }
`;

export default {
  list,
  totalCount
};
