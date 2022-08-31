const tags = `
  query tagsQuery($type: String, $tagIds: [String], $parentId: String) {
    tags(type: $type, tagIds: $tagIds, parentId: $parentId) {
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
