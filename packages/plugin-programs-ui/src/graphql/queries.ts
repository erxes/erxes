const programs = `
  query programs(
    $page: Int
    $perPage: Int
    $categoryId: String
    $ids: [String]
    $searchValue: String
    $sortField: String
    $sortDirection: Int
    $statuses: [String]
  ) {
    programs(
      page: $page
      perPage: $perPage
      categoryId: $categoryId
      ids: $ids
      searchValue: $searchValue
      sortField: $sortField
      sortDirection: $sortDirection
      statuses: $statuses
    ) {
      list {
        _id
        name
        code
        description
        createdAt
        type
        duration
        attachment {
          url
          name
          type
          size
          duration
        }
        category{
          _id
          name
        }
        status
        startDate
        endDate
        deadline
        unitPrice
        commentCount
      }
      totalCount
    }
  }
`;

const programCategories = `
  query programCategories($parentId: String, $searchValue: String) {
    programCategories(parentId: $parentId, searchValue: $searchValue) {
      _id
      code
      description
      isRoot
      name
      order
      parentId
      programCount
    }
  }
`;

const programCategoriesCount = `
  query programCategoriesCount {
    programCategoriesCount
  }
`;

export default {
  programs,
  programCategories,
  programCategoriesCount,
};
