import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const BRAND_INLINE_QUERY = gql`
  query BrandInline($_id: String!) {
    brandDetail(_id: $_id) {
      _id
      code
      name
    }
  }
`;

export const BRANDS_QUERY = gql`
  query Brands($searchValue: String, ${GQL_CURSOR_PARAM_DEFS}) {
    brands(searchValue: $searchValue, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        name
        code
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_BRAND_BY_ID = gql`
  query BrandDetail($id: String!) {
    brandDetail(_id: $id) {
      _id
      name
      code
    }
  }
`;
