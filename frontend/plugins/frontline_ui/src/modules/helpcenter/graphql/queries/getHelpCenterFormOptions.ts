import { gql } from '@apollo/client';

export const GET_HELP_CENTER_FORM_OPTIONS = gql`
  query frontlineHelpCenterFormOptions($channelId: String!, $limit: Int) {
    forms(channelId: $channelId, status: "active", limit: $limit) {
      list {
        _id
        name
        title
      }
    }
  }
`;
