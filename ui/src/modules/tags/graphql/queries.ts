const tags = `
  query tagsQuery($type: String) {
    tags(type: $type) {
      _id
      name
      type
      colorCode
      createdAt
      objectCount
      totalObjectCount
      parentId
      order
    }
  }
`;

export default {
  tags
};
