import { gql } from '~/gql';

const productsMain = gql(`
query accountingProductsRemainderMain($type: String, $categoryIds: [String], $searchValue: String, $vendorId: String, $brandIds: [String], $tagIds: [String], $segment: String, $sortField: String, $sortDirection: Int, $branchId: String, $departmentId: String, $minRemainder: Float, $maxRemainder: Float, $minPrice: Float, $maxPrice: Float, $minDiscountValue: Float, $maxDiscountValue: Float, $minDiscountPercent: Float, $maxDiscountPercent: Float, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
  productsMain(
    type: $type
    categoryIds: $categoryIds
    searchValue: $searchValue
    vendorId: $vendorId
    brandIds: $brandIds
    tagIds: $tagIds
    segment: $segment
    sortField: $sortField
    sortDirection: $sortDirection
    branchId: $branchId
    departmentId: $departmentId
    minRemainder: $minRemainder
    maxRemainder: $maxRemainder
    minPrice: $minPrice
    maxPrice: $maxPrice
    minDiscountValue: $minDiscountValue
    maxDiscountValue: $maxDiscountValue
    minDiscountPercent: $minDiscountPercent
    maxDiscountPercent: $maxDiscountPercent
    cursor: $cursor
    cursorMode: $cursorMode
    direction: $direction
    limit: $limit
  ) {
    list {
      _id
      categoryId
      code
      createdAt
      category {
        _id
        name
      }
      name
      shortName
      uom
      unitPrice
      type
      inventories
      remainder
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`);

const productCategories = gql(`
query accountingProductCategories {
  productCategories {
    _id
    parentId
    attachment {
      url
    }
    code
    name
    order
    productCount
  }
}
`);

const productTags = gql(`
query accountingTags($searchValue: String, $limit: Int) {
  tags(type: "core:product", searchValue: $searchValue, limit: $limit) {
    list {
      _id
      colorCode
      order
      name
    }
  }
}
`);

const productCategoryDetail = gql(`
query accountingProductCategoryDetail($_id: String) {
  productCategoryDetail(_id: $_id) {
    _id
    name
    description
    meta
    parentId
    code
    order
    scopeBrandIds
    attachment {
      url
      name
      size
      type
      __typename
    }
    status
    isRoot
    productCount
    maskType
    mask
    isSimilarity
    similarities
    __typename
  }
}
`);

export const productsQueries = {
  productsMain,
  productCategories,
  productTags,
  productCategoryDetail,
};
