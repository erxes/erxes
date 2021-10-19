const commonFields = `
brandId
name
kind
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
isActive
`

const posList = `
  query posList {
    allPos {
      _id
      name
      description
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
`

const productGroups = `
  query productGroups($posId: String!) {
    productGroups(posId: $posId) {
      _id
      posId
      name
      description
      categoryIds
      excludeCategoryIds
      excludeProductIds
    }
  }
`

const brands = `
  query brands($page: Int, $perPage: Int, $searchValue: String) {
    brands(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      code
      name
      createdAt
      description
      emailConfig
    }
  }
`;

const integrationsTotalCount = `
  query integrationsTotalCount($kind: String, $tag: String, $brandId: String, $status: String){
    integrationsTotalCount(kind:$kind, tag:$tag, brandId: $brandId, status: $status){
      byKind
      byTag
      byBrand
      byStatus
      total
    }
  }
`;

const integrations = `
  query integrations($perPage: Int, $page: Int, $kind: String, $tag: String, $brandId: String, $status: String, $sortField: String, $sortDirection: Int) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag, brandId: $brandId, status: $status, sortField: $sortField, sortDirection: $sortDirection) {
      _id
      ${commonFields}
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      ${commonFields}
    }
  }
`;

const posConfig = `
  query posConfig($integrationId: String!) {
    posConfig(integrationId: $integrationId) {
      _id
      integrationId
      productDetails
      productGroupIds
      productGroups {
        name
        description
        categoryIds
        excludeCategoryIds
        excludeProductIds
      }
    }
  }
`;

const posDetail =`
query posDetail($integrationId: String!) {
  posDetail(integrationId: $integrationId) {
    _id
    name
    description
    createdAt
    integrationId
    productDetails
    productGroupIds
  }
}
`

export default {
  posList,
  configs,
  productGroups,
  brands,
  integrationsTotalCount,
  integrations,
  integrationDetail,
  posConfig,
  posDetail
};
