import { gql } from '~/gql';

export const GET_CONFIGS = gql(`
  query InstagramGetConfigs {
    instagramGetConfigs {
      _id
      code
      value
    }
  }
`);
