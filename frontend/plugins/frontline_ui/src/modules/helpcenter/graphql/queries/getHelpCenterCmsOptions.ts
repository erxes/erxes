import { gql } from '@apollo/client';

export const GET_HELP_CENTER_CMS_OPTIONS = gql`
  query frontlineHelpCenterCmsOptions {
    contentCMSList {
      _id
      name
      clientPortalId
    }
  }
`;

export const GET_HELP_CENTER_CMS_PORTAL_TOKEN = gql`
  query frontlineHelpCenterCmsPortalToken($_id: String) {
    getClientPortal(_id: $_id) {
      _id
      token
    }
  }
`;
