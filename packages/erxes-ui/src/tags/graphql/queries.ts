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
      relatedIds
    }
  }
`;

const tagsGetTypes = `
  query tagsGetTypes {
    tagsGetTypes
  }
`;

export default {
  tags,
  tagsGetTypes
};
