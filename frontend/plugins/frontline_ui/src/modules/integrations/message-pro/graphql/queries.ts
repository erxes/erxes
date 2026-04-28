import { gql } from '@apollo/client';

export const GET_CONFIGS_BY_CODES = gql`
  query ConfigsByCode($codes: [String]) {
    configsByCode(codes: $codes) {
      _id
      code
      value
    }
  }
`;
