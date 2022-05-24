const tags = `
  query tagsQuery($type: String, $tagIds: [String]) {
    tags(type: $type, tagIds: $tagIds) {
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
