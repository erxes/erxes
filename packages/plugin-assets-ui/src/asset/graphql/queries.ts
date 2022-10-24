import { assetFields } from '../../common/graphql/asset';

const assets = `
  query assets(
    $parentId: String,
    $categoryId: String,
    $searchValue: String,
    $perPage: Int,
    $page: Int $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $ignoreIds: [String]
  ) {
    assets(
      categoryId: $categoryId,
      parentId: $parentId,
      searchValue: $searchValue,
      perPage: $perPage,
      page: $page ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      ignoreIds: $ignoreIds
    ) {
      ${assetFields}
    }
  }
`;

const assetsCount = `
  query assetsTotalCount(
    $parentId: String,
    $categoryId: String,
    $searchValue: String,
    $perPage: Int,
    $page: Int $ids: [String],
  ) {
    assetsTotalCount(
      categoryId: $categoryId,
      parentId: $parentId,
      searchValue: $searchValue,
      perPage: $perPage,
      page: $page ids: $ids,
    )
  }
`;

const assetDetail = `
  query assetDetail($_id: String) {
    assetDetail(_id: $_id) {
      ${assetFields}
      customFieldsData
    }
  }
`;

export default { assets, assetsCount, assetDetail };
