import gql from 'graphql-tag';

export const GET_POS_LIST = gql`
  query PosList(
    $search: String
  ) {
    posList(
      search: $search
    ) {
      _id
      name
      token
      onServer
      __typename
    }
  }
`;
