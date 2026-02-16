import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

const productsMain = gql`
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

const productCategories = gql`
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

const productTags = gql`
  query Tags($searchValue: String, $perPage: Int) {
    tags(type: "core:product", searchValue: $searchValue, perPage: $perPage) {
      _id
      colorCode
      order
      name
    }
  }
`;

const productCategoryDetail = gql`
  query productCategoryDetail($_id: String) {
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
`;

export const productsQueries = {
  productsMain,
  productCategories,
  productTags,
  productCategoryDetail,
};
