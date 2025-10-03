import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

const GET_BRANDS = gql`
  query Brands($searchValue: String, $orderBy: JSON, ${GQL_CURSOR_PARAM_DEFS}) {
    brands(searchValue: $searchValue, orderBy: $orderBy, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        code
        createdAt
        description
        memberIds
        name
        userId
        emailConfig
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

const GET_BRAND_BY_ID = gql`
  query BrandDetail($id: String!) {
    brandDetail(_id: $id) {
      _id
      code
      createdAt
      description
      memberIds
      name
      userId
      emailConfig
    }
  }
`;

export { GET_BRANDS, GET_BRAND_BY_ID };
