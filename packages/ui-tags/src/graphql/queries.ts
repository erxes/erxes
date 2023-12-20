const tags = `
  query tagsQuery(
    $type: String,
    $tagIds: [String],
    $parentId: String,
    $searchValue: String,
    $ids: [String],
    $excludeIds: Boolean,
    $page: Int,
    $perPage: Int
  ) {
    tags(type: $type,
      tagIds: $tagIds,
      parentId: $parentId,
      searchValue: $searchValue,
      ids: $ids,
      excludeIds: $excludeIds,
      page: $page,
      perPage: $perPage
    ) {
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

const tagsQueryCount = `
  query tagsQueryCount($type: String, $searchValue: String) {
    tagsQueryCount(type: $type, searchValue: $searchValue)
  }
`;

const tagsGetTypes = `
  query tagsGetTypes {
    tagsGetTypes
  }
`;

export default {
  tags,
  tagsGetTypes,
  tagsQueryCount
};
