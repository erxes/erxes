import { gql } from '@apollo/client';

export const GET_CONFIGS_GET_VALUE = gql`
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;
