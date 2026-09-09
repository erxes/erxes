import { gql } from '@apollo/client';

export const GET_HELP_CENTER_WEBSITE_OPTIONS = gql`
  query frontlineHelpCenterWebsiteOptions {
    getClientPortals {
      list {
        _id
        domain
        token
      }
    }
  }
`;
