const list = `
  query listQuery {
    xyps {
      _id
      name
      url
      token
      createdAt
      
    }
  }
`;

const totalCount = `
  query xypsTotalCount{
    xypsTotalCount
  }
`;

export default {
  list,
  totalCount
};
