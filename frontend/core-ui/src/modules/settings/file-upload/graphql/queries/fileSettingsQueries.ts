import { gql } from '@apollo/client';

const GET_CONFIGS = gql`
  query Configs {
    configs {
      _id
      code
      value
    }
  }
`;

export const fileSettingsQueries = {
  GET_CONFIGS,
};
