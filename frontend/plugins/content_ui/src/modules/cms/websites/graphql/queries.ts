import { gql } from '@apollo/client';

export const CONTENT_CMS_LIST = gql`
  query contentCmsList {
    contentCMSList {
      _id
      clientPortalId
      content
      createdAt
      updatedAt
      name
      languages
      language
      postUrlField
      postUrlPrefix
      accessPolicy
      assignedMemberIds
      description
      domain
      publicUrl
      metaTitle
      metaDescription
      metaKeywords
      metaImage {
        url
        name
        type
        size
        duration
      }
      googleTrackingId
      googleTagManagerId
      customScripts
      defaultPostStatus
      allowComments
      siteLogo {
        url
        name
        type
        size
        duration
      }
      favicon {
        url
        name
        type
        size
        duration
      }
    }
  }
`;

export const GET_WEBSITES = gql`
  query contentWebsiteOptions {
    getClientPortals(filter: {}) {
      list {
        _id
        name
        description
        domain
        createdAt
        __typename
      }
      totalCount
    }
  }
`;

export const GET_CLIENT_PORTALS = gql`
  query contentClientPortalList($filter: IClientPortalFilter) {
    getClientPortals(filter: $filter) {
      list {
        _id
        name
        domain
        token
        createdAt
        updatedAt
        __typename
      }
      totalCount
      pageInfo {
        hasNextPage
        __typename
      }
      __typename
    }
  }
`;
