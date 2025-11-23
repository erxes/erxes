import { gql } from '@apollo/client';

const GET_CONFIGS = gql`
  query configsGetValue($code: String!) {
    configsGetValue(code: $code)
  }
`;

export const stageInEBarimtConfigQueries = {
  GET_CONFIGS,
};
