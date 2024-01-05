import { assetFields } from '../../common/graphql/asset';

export const listParamDefs = `
    $parentId: String,
    $categoryId: String,
    $searchValue: String,
    $perPage: Int,
    $page: Int,
    $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $ignoreIds: [String]
    $irregular: Boolean
    $articleIds: [String]
    $withKnowledgebase:Boolean
`;

export const listParams = `
      categoryId: $categoryId,
      parentId: $parentId,
      searchValue: $searchValue,
      perPage: $perPage,
      page: $page,
      ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      ignoreIds: $ignoreIds
      irregular: $irregular,
      articleIds:$articleIds
      withKnowledgebase:$withKnowledgebase
`;

const assets = `
  query assets(${listParamDefs}) {
    assets(${listParams}) {
      ${assetFields}
      kbArticleIds
    }
  }
`;

const assetsCount = `
  query assetsTotalCount(${listParamDefs}) {
    assetsTotalCount(${listParams})
  }
`;

const assetDetail = `
  query assetDetail($_id: String) {
    assetDetail(_id: $_id) {
      ${assetFields}
      customFieldsData
      kbArticleIds
      knowledgeData
    }
  }
`;

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
        duration
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
      topicId
    }
  }
`;

export default {
  assets,
  assetsCount,
  assetDetail,
  assetCategory,
  assetCategoryDetail,
  assetCategoriesTotalCount,
  knowledgeBaseArticles,
  knowledgeBaseTopics
};
