const list = `
  query forumsQuery {
    forums {
      _id
      name
    }
  }
`;

const totalCount = `
  query forumsTotalCountQuery {
    forumsTotalCount
  }
`;

export default {
  list,
  totalCount
};
