import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

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
        code
        name
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
