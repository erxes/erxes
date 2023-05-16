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
      irregular: $irregular
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

export default { assets, assetsCount, assetDetail };
