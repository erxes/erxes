import { gql } from '~/gql';

export const CONTENT_CMS_LIST = gql(`
  query ContentCMSList {
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
`);

export const GET_WEBSITES = gql(`
  query CmsWebsites {
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
`);

export const CMS_MENU_ADD = gql(`
  mutation cmsAddMenu($input: MenuItemInput!) {
    cmsAddMenu(input: $input) {
      _id
      parentId
      label
      contentType
      contentTypeId
      linkType
      kind
      icon
      url
      order
      target
      __typename
    }
  }
`);

export const CMS_MENU_EDIT = gql(`
  mutation cmsEditMenu($_id: String!, $input: MenuItemInput!) {
    cmsEditMenu(_id: $_id, input: $input) {
      _id
      parentId
      label
      contentType
      contentTypeId
      linkType
      kind
      icon
      url
      order
      target
      __typename
    }
  }
`);

export const CMS_MENU_REMOVE = gql(`
  mutation cmsRemoveMenu($_id: String!) {
    cmsRemoveMenu(_id: $_id)
  }
`);

export const CMS_TAGS = gql(`
  query CmsTags(
    $clientPortalId: String
    $cursor: String
    $limit: Int
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $sortField: String
    $searchValue: String
    $language: String
    $aggregationPipeline: [JSON]
    $sortDirection: String
  ) {
    cmsTags(
      clientPortalId: $clientPortalId
      cursor: $cursor
      limit: $limit
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      sortField: $sortField
      searchValue: $searchValue
      language: $language
      aggregationPipeline: $aggregationPipeline
      sortDirection: $sortDirection
    ) {
      tags {
        _id
        colorCode
        clientPortalId
        createdAt
        name
        slug
        updatedAt
        translations {
          language
          title
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`);

export const POSTS_ADD = gql(`
  mutation PostsAdd($input: PostInput!) {
    cmsPostsAdd(input: $input) {
      _id
      count
      slug
      __typename
    }
  }
`);

export const CMS_POSTS_EDIT = gql(`
  mutation CmsPostsEdit($id: String!, $input: PostInput!) {
    cmsPostsEdit(_id: $id, input: $input) {
      _id
      type
      customPostType {
        _id
        code
        label
        __typename
      }
      authorKind
      authorId
      author {
        ... on User {
          userId: _id
          username
          email
          details {
            fullName
            shortName
            avatar
            firstName
            lastName
            middleName
            __typename
          }
          __typename
        }
        __typename
      }
      clientPortalId
      title
      count
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      featured
      featuredDate
      publishedDate
      scheduledDate
      autoArchiveDate
      reactions
      reactionCounts
      thumbnail {
        url
        type
        name
        __typename
      }
      images {
        url
        name
        type
        size
        duration
      }
      video {
        url
        type
        name
        __typename
      }
      audio {
        url
        type
        name
        __typename
      }
      documents {
        url
        type
        name
        __typename
      }
      attachments {
        url
        type
        name
        __typename
      }
      pdfAttachment {
        pdf {
          url
          name
          type
          size
          duration
        }
        pages {
          url
          name
          type
          size
          duration
        }
      }
      videoUrl
      createdAt
      updatedAt
      categories {
        _id
        name
        slug
        __typename
      }
      customFieldsData
      customFieldsMap
      __typename
    }
  }
`);

export const CMS_POST = gql(`
  query Post($id: String) {
    cmsPost(_id: $id) {
      _id
      type
      clientPortalId
      title
      count
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      authorId
      featured
      featuredDate
      publishedDate
      scheduledDate
      autoArchiveDate
      seoTitle
      seoDescription
      reactions
      reactionCounts
      thumbnail {
        url
        type
        name
        __typename
      }
      images {
        url
        type
        name
        __typename
      }
      video {
        url
        type
        name
        __typename
      }
      audio {
        url
        type
        name
        __typename
      }
      documents {
        url
        type
        name
        __typename
      }
      attachments {
        url
        type
        name
        __typename
      }
      pdfAttachment {
        pages {
          url
          name
          type
          size
          duration
          __typename
        }
        __typename
      }
      videoUrl
      createdAt
      updatedAt
      authorKind
      author {
        ... on User {
          userId: _id
          username
          email
          details {
            fullName
            shortName
            avatar
            firstName
            lastName
            middleName
            __typename
          }
          __typename
        }
        __typename
      }
      categories {
        _id
        name
        slug
        __typename
      }
      customFieldsData
      __typename
    }
  }
`);

export const CMS_POSTS_REMOVE = gql(`
  mutation CmsPostsRemove($id: String!) {
    cmsPostsRemove(_id: $id)
  }
`);

export const CMS_MENU_LIST = gql(`
  query cmsMenuList(
    $clientPortalId: String
    $kind: String
    $language: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    cmsMenuList(
      clientPortalId: $clientPortalId
      kind: $kind
      language: $language
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      _id
      parentId
      label
      contentType
      contentTypeId
      linkType
      kind
      icon
      url
      order
      target
      translations {
        language
      }
      __typename
    }
  }
`);

export const GET_CLIENT_PORTALS = gql(`
  query getClientPortals($filter: IClientPortalFilter) {
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
`);

export const CMS_CUSTOM_FIELD_GROUPS = gql(`
  query cmsPageCustomFieldGroupList($clientPortalId: String!) {
    cmsCustomFieldGroupList(clientPortalId: $clientPortalId) {
      list {
        _id
        label
        code
        clientPortalId
        customPostTypeIds
        customPostTypes {
          _id
          code
          label
          pluralLabel
        }
        enabledPageIds
        enabledCategoryIds
        enabledPostIds
        fields
      }
    }
  }
`);

export const CMS_CUSTOM_POST_TYPES = gql(`
  query cmsCustomPostTypes($clientPortalId: String) {
    cmsCustomPostTypes(clientPortalId: $clientPortalId) {
      _id
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`);

export const CMS_CUSTOM_POST_TYPE_ADD = gql(`
  mutation cmsCustomPostTypesAdd($input: CustomPostTypeInput!) {
    cmsCustomPostTypesAdd(input: $input) {
      _id
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`);

export const CMS_CUSTOM_POST_TYPE_EDIT = gql(`
  mutation cmsCustomPostTypesEdit($_id: String!, $input: CustomPostTypeInput!) {
    cmsCustomPostTypesEdit(_id: $_id, input: $input) {
      _id
      code
      label
      pluralLabel
      description
      createdAt
    }
  }
`);

export const CMS_TRANSLATIONS = gql(`
  query cmsTranslations($objectId: String, $type: String) {
    cmsTranslations(objectId: $objectId, type: $type) {
      _id
      objectId
      language
      title
      content
      excerpt
      customFieldsData
      type
    }
  }
`);

export const CMS_EDIT_TRANSLATION = gql(`
  mutation cmsEditTranslation($input: TranslationInput!) {
    cmsEditTranslation(input: $input) {
      _id
      objectId
      language
      title
      content
      excerpt
      customFieldsData
      type
    }
  }
`);
