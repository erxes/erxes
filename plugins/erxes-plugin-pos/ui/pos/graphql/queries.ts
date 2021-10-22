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

const posCommonFields = `
_id
name
description
createdAt
integrationId
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
waitingScreen
`

const posList = `
  query posList {
    posList {
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
`

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



const posDetail = `
query posDetail($_id: String!) {
  posDetail(_id: $_id) {
    ${posCommonFields}
    productDetails
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
  posDetail
};
