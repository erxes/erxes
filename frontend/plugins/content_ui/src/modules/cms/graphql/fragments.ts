import { gql } from '@apollo/client';

export const PageInfoFragment = gql`
  fragment PageInfo on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

export const CmsFieldsFragment = gql`
  fragment CmsFields on ContentCMS {
    _id
    clientPortalId
    createdAt
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
    language
    languages
    name
    postUrlField
    postUrlPrefix
    accessPolicy
    assignedMemberIds
    updatedAt
    content
  }
`;
