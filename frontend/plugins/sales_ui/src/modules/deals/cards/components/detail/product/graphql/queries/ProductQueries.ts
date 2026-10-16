import { gql } from '~/gql';

export const GET_PRODUCTS = gql(`
  query ProductsMain(
    $type: String
    $categoryIds: [String]
    $searchValue: String
    $vendorId: String
    $brandIds: [String]
    $tagIds: [String]
    $segment: String
    $sortField: String
    $sortDirection: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
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
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        attachment {
          url
        }
        categoryId
        code
        createdAt
        propertiesData
        description
        tagIds
        category {
          _id
          name
        }
        name
        shortName
        uom
        unitPrice
        type
        vendor {
          _id
          primaryName
        }
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

export const productCategories = gql(`
  query salesDealProductCategories {
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

export const productTags = gql(`
  query salesDealProductTags($searchValue: String, $limit: Int) {
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

export const productCategoryDetail = gql(`
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      code
      name
      productCount
      __typename
    }
  }
`);
