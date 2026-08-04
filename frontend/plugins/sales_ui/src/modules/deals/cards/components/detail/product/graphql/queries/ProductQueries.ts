import {
  GQL_CURSOR_PARAMS,
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query ProductsMain(
    $type: String
    $categoryIds: [String]
    $searchValue: String
    $vendorId: String
    $brandIds: [String]
    $tagIds: [String]
    $segment: String
    $segmentData: String
    $sortField: String
    $sortDirection: Int
     ${GQL_CURSOR_PARAM_DEFS}
  ) {
    productsMain(
      type: $type
      categoryIds: $categoryIds
      searchValue: $searchValue
      vendorId: $vendorId
      brandIds: $brandIds
      tagIds: $tagIds
      segment: $segment
      segmentData: $segmentData
      sortField: $sortField
      sortDirection: $sortDirection
      ${GQL_CURSOR_PARAMS}
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
        ${GQL_PAGE_INFO}
    }
  }
`;

export const productCategories = gql`
  query ProductCategories {
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
`;

export const productTags = gql`
  query Tags($searchValue: String, $perPage: Int) {
    tags(type: "core:product", searchValue: $searchValue, perPage: $perPage) {
      _id
      colorCode
      order
      name
    }
  }
`;

export const productCategoryDetail = gql`
  query productCategoryDetail($_id: String) {
    productCategoryDetail(_id: $_id) {
      _id
      code
      name
      productCount
      __typename
    }
  }
`;