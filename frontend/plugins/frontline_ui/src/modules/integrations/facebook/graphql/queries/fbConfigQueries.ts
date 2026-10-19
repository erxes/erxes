import { gql } from '~/gql';

export const GET_CONFIGS = gql(`
  query FacebookGetConfigs {
    facebookGetConfigs {
      _id
      code
      value
    }
  }
`);
