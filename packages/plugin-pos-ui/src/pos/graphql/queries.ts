const commonFields = `
  brandId
  name
  kind
  isActive

  brand {
    _id
    name
    code
  }

  tags {
    _id
    name
    colorCode
  }
`;

const posCommonFields = `
  _id
  name
  description
  createdAt
  integrationId
  token
  adminIds
  cashierIds

  integration {
    brandId
    brand {
      _id
      name
      code
    }
    isActive
    tags {
      _id
      name
      colorCode
    }
  }

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
  formSectionTitle
  formIntegrationIds
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
    $brandId: String
    $tag: String
    $status: String
    $sortField: String
    $sortDirection: Int
  ) {
    posList(
      ${commonParams}
      brandId: $brandId
      tag: $tag
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

const brands = `
  query brands(${commonParamDefs}, $searchValue: String) {
    brands(${commonParams}, searchValue: $searchValue) {
      _id
      code
      name
      createdAt
      description
      emailConfig
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

const integrationsTotalCount = `
  query integrationsTotalCount($kind: String, $tag: String, $brandId: String, $status: String) {
    integrationsTotalCount(kind:$kind, tag:$tag, brandId: $brandId, status: $status) {
      byKind
      byTag
      byBrand
      byStatus
      total
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

const integrations = `
  query integrations(${commonParamDefs}, $kind: String, $tag: String, $brandId: String, $status: String, $sortField: String, $sortDirection: Int) {
    integrations(${commonParams}, kind: $kind, tag: $tag, brandId: $brandId, status: $status, sortField: $sortField, sortDirection: $sortDirection) {
      _id
      ${commonFields}
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
  brands,
  integrationsTotalCount,
  posDetail,
  getDbSchemaLabels,
  tags,
  integrations,
  branches,
  fieldsCombinedByContentType
};
