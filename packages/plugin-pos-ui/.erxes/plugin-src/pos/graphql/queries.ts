const posCommonFields = `
  _id
  name
  description
  createdAt
  token
  adminIds
  cashierIds

  user {
    _id
    details {
      avatar
      fullName
    }
  }

  isOnline
  branchId
  allowBranchIds
  beginNumber
  maxSkipNumber
  waitingScreen
  kitchenScreen
  kioskMachine
  uiOptions
  ebarimtConfig
  erkhetConfig

  catProdMappings {
    _id
    categoryId
    productId
  }
  initialCategoryIds
  kioskExcludeProductIds
  deliveryConfig
`;

const commonParamDefs = `
  $page: Int,
  $perPage: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
`;

const posList = `
  query posList(
    ${commonParamDefs}
    $status: String
    $sortField: String
    $sortDirection: Int
  ) {
    posList(
      ${commonParams}
      status: $status
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${posCommonFields}
    }
  }
`;

const configs = `
  query posConfigs($posId: String!) {
    posConfigs(posId: $posId) {
      _id
      posId
      code
      value
    }
  }
`;

const productGroups = `
  query productGroups($posId: String!) {
    productGroups(posId: $posId) {
      _id
      posId
      name
      description
      categoryIds
      excludedCategoryIds
      excludedProductIds
    }
  }
`;

const branches = `
  query branches {
    branches {
      _id
      title
      address
      parentId
      supervisorId
      code
      userIds
    }
  }
`;

const posDetail = `
  query posDetail($_id: String!) {
    posDetail(_id: $_id) {
      ${posCommonFields}
      productDetails
    }
  }
`;

const getDbSchemaLabels = `
  query getDbSchemaLabels($type: String) {
    getDbSchemaLabels(type: $type) {
      name
      label
    }
  }
`;

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

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!, $pipelineId: String) {
    fieldsCombinedByContentType(contentType: $contentType, pipelineId: $pipelineId)
  }
`;

export default {
  posList,
  configs,
  productGroups,
  posDetail,
  getDbSchemaLabels,
  tags,
  branches,
  fieldsCombinedByContentType
};
