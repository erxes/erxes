import { gql } from '@apollo/client';

export const GET_ENV_CONFIG = gql`
  query ConfigsGetEnv {
    configsGetEnv {
      RELEASE
    }
  }
`;
