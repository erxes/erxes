import { gql } from '~/gql';

export const GET_HELP_CENTER_WEBSITE_OPTIONS = gql(`
  query frontlineHelpCenterWebsiteOptions {
    getClientPortals {
      list {
        _id
        name
        domain
        token
      }
    }
  }
`);
