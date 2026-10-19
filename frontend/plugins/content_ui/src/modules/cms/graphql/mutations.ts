import { gql } from '~/gql';

export const CONTENT_CREATE_CMS = gql(`
  mutation ContentCreateCMS($input: ContentCMSInput) {
    contentCreateCMS(input: $input) {
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
  }
`);

export const CONTENT_UPDATE_CMS = gql(`
  mutation ContentUpdateCMS($id: String!, $input: ContentCMSInput) {
    contentUpdateCMS(id: $id, input: $input) {
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
  }
`);

export const CONTENT_DELETE_CMS = gql(`
  mutation ContentDeleteCMS($id: String!) {
    contentDeleteCMS(id: $id)
  }
`);

// CMS: Custom Post Types
