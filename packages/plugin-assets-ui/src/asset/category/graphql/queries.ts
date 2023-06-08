const assetCategory = `
  query assetCategories($status: String) {
    assetCategories(status: $status) {
      _id
      name
      order
      code
      parentId
      description
      status
      attachment {
        name
        url
        type
        size
      }
      isRoot
      assetCount
    }
  }
`;

const assetCategoryDetail = `
  query assetCategoryDetail($_id: String) {
    assetCategoryDetail(_id: $_id) {
      _id
      name
      assetCount
    }
  }
`;

const assetCategoriesTotalCount = `
  query assetCategoriesTotalCount {
    assetCategoriesTotalCount
  }
`;

const knowledgeBaseTopics = `
  query knowledgeBaseTopics {
    knowledgeBaseTopics {
      _id
      title
      categories {
        _id
        title
        numOfArticles
        parentCategoryId
      }
    }
  }
`;
const knowledgeBaseArticles = `
  query knowledgeBaseArticles($categoryIds: [String],$perPage:Int) {
    knowledgeBaseArticles(categoryIds: $categoryIds,perPage:$perPage) {
      _id
      title
      categoryId
    }
  }
`;

export default {
  assetCategory,
  assetCategoryDetail,
  assetCategoriesTotalCount,
  knowledgeBaseArticles,
  knowledgeBaseTopics
};
