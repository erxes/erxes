import {
  GQL_CURSOR_PARAMS,
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query SelectProduct(
    $searchValue: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    productsMain(
      searchValue: $searchValue
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        category {
          _id
          name
        }
        categoryId
        code
        currency
        name
        unitPrice
        uom
        vendorId
        vendor {
          _id
          names
          primaryName
        }
        type
        barcodes
        subUoms
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_ASSIGNED_PRODUCTS = gql`
  query AssignedProducts($ids: [String]) {
    productsMain(ids: $ids) {
      list {
        _id
        name
        code
      }
    }
  }
`;

export const GET_PRODUCT_INLINE = gql`
  query ProductInline($_id: String) {
    productDetail(_id: $_id) {
      _id
      name
      code
    }
  }
`;

export const UOM_QUERY = gql`
  query uoms {
    uoms {
      _id
      name
      code
      createdAt
      isForSubscription
      subscriptionConfig
    }
  }
`;
