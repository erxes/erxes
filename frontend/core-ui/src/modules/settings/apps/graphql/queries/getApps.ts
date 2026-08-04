import { gql } from '@apollo/client';

const GET_APPS = gql`
  query Apps($searchValue: String, $page: Int, $perPage: Int) {
    apps(searchValue: $searchValue, page: $page, perPage: $perPage) {
      _id
      name
      token
      status
      lastUsedAt
      createdAt
    }
    appsTotalCount(searchValue: $searchValue)
  }
`;

export { GET_APPS };
