import { gql } from '@apollo/client';

export const CONTENT_CMS_LIST = gql`
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
      description
    }
  }
`;

export const GET_WEBSITES = gql`
  query getClientPortals {
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

export const CMS_MENU_ADD = gql`
  mutation cmsAddMenu($input: MenuItemInput!) {
    cmsAddMenu(input: $input) {
      _id
      parentId
      label
      contentType
      contentTypeID
      kind
      icon
      url
      order
      target
      __typename
    }
  }
`;

export const CMS_MENU_EDIT = gql`
  mutation cmsEditMenu($_id: String!, $input: MenuItemInput!) {
    cmsEditMenu(_id: $_id, input: $input) {
      _id
      parentId
      label
      contentType
      contentTypeID
      kind
      icon
      url
      order
      target
      __typename
    }
  }
`;

export const CMS_MENU_REMOVE = gql`
  mutation cmsRemoveMenu($_id: String!) {
    cmsRemoveMenu(_id: $_id)
  }
`;

export const CLIENT_PORTAL_REMOVE = gql`
  mutation ClientPortalRemove($_id: String!) {
    clientPortalRemove(_id: $_id)
  }
`;

export const ARTICLES = gql`
  query knowledgeBaseArticles(
    $limit: Int
    $cursor: String
    $direction: String
    $categoryIds: [String]
  ) {
    knowledgeBaseArticles(
      limit: $limit
      cursor: $cursor
      direction: $direction
      categoryIds: $categoryIds
    ) {
      list {
        _id
        title
        code
        summary
        content
        status
        categoryId
        createdDate
        modifiedDate
        createdUser {
          _id
          username
          email
        }
        publishedUser {
          _id
          username
          email
          details {
            avatar
            fullName
          }
        }
        createdBy
        modifiedBy
        tags
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      totalCount
    }
  }
`;

export const POST_LIST = gql`
  query PostList(
    $clientPortalId: String!
    $type: String
    $featured: Boolean
    $searchValue: String
    $status: PostStatus
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
  ) {
    cmsPostList(
      clientPortalId: $clientPortalId
      featured: $featured
      type: $type
      searchValue: $searchValue
      status: $status
      limit: $limit
      cursor: $cursor
      direction: $direction
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      posts {
        _id
        type
        customPostType {
          _id
          code
          label
          __typename
        }
        authorKind
        author {
          ... on User {
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
          # Remove or replace the ClientPortalUser fragment if not needed
          __typename
        }
        featured
        status
        tagIds
        # Remove or replace the tags field if not available
        authorId
        createdAt
        autoArchiveDate
        scheduledDate
        excerpt
        thumbnail {
          url
          __typename
        }
        title
        updatedAt
        __typename
      }
      __typename
    }
  }
`;

export const CMS_TAGS = gql`
  query CmsTags(
    $clientPortalId: String
    $limit: Int
    $cursor: String
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
      limit: $limit
      cursor: $cursor
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
      }
    }
  }
`;

export const POSTS_ADD = gql`
  mutation PostsAdd($input: PostInput!) {
    cmsPostsAdd(input: $input) {
      _id
      __typename
    }
  }
`;

export const CMS_POSTS_EDIT = gql`
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
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      featured
      featuredDate
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
`;

export const CMS_POST = gql`
  query Post($id: String) {
    cmsPost(_id: $id) {
      _id
      type
      clientPortalId
      title
      slug
      content
      excerpt
      categoryIds
      status
      tagIds
      authorId
      featured
      featuredDate
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
`;

export const CMS_POSTS_REMOVE = gql`
  mutation CmsPostsRemove($id: String!) {
    cmsPostsRemove(_id: $id)
  }
`;

export const CMS_TAGS_ADD = gql`
  mutation CmsTagsAdd($input: PostTagInput!) {
    cmsTagsAdd(input: $input) {
      _id
      __typename
    }
  }
`;

export const CMS_TAGS_EDIT = gql`
  mutation CmsTagsEdit($_id: String!, $input: PostTagInput!) {
    cmsTagsEdit(_id: $_id, input: $input) {
      _id
      clientPortalId
      name
      slug
      colorCode
      createdAt
      updatedAt
    }
  }
`;

export const CMS_TAGS_REMOVE = gql`
  mutation CmsTagsRemove($id: String!) {
    cmsTagsRemove(_id: $id)
  }
`;
export const CMS_CATEGORIES = gql`
  query CmsCategories(
    $clientPortalId: String!
    $searchValue: String
    $status: CategoryStatus
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $sortField: String
    $sortDirection: String
  ) {
    cmsCategories(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      status: $status
      limit: $limit
      cursor: $cursor
      direction: $direction
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      list {
        _id
        clientPortalId
        createdAt
        description
        name
        slug
        status
        customFieldsData
        parent {
          _id
          clientPortalId
          name
          slug
          description
          parentId
          status
          parent {
            _id
            clientPortalId
            name
            slug
            description
            parentId
            status
            parent {
              _id
              clientPortalId
              name
              slug
              description
              parentId
              status
              createdAt
              updatedAt
              customFieldsData
              customFieldsMap
            }
            createdAt
            updatedAt
            customFieldsData
            customFieldsMap
          }
          createdAt
          updatedAt
          customFieldsData
          customFieldsMap
        }
        parentId
        __typename
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const CMS_CATEGORIES_EDIT = gql`
  mutation CmsCategoriesEdit($_id: String!, $input: PostCategoryInput!) {
    cmsCategoriesEdit(_id: $_id, input: $input) {
      _id
      name
      slug
      __typename
    }
  }
`;

export const CMS_CATEGORIES_REMOVE = gql`
  mutation CmsCategoriesRemove($id: String!) {
    cmsCategoriesRemove(_id: $id)
  }
`;

export const CMS_CATEGORIES_ADD = gql`
  mutation CmsCategoriesAdd($input: PostCategoryInput!) {
    cmsCategoriesAdd(input: $input) {
      _id
      name
      slug
      __typename
    }
  }
`;

export const PAGE_LIST = gql`
  query PageList(
    $clientPortalId: String!
    $searchValue: String
    $language: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    cmsPageList(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      language: $language
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      pages {
        _id
        name
        description
        slug
        clientPortalId
        createdAt
        customFieldsData
        createdUser {
          _id
          email
          details {
            fullName
            firstName
            lastName
            middleName
            shortName
            avatar
            __typename
          }
          __typename
        }
        createdUserId
        updatedAt
        __typename
      }
      __typename
    }
  }
`;

export const CLIENT_PORTAL_GET_CONFIGS = gql`
  query clientPortalGetConfigs($searchValue: String) {
    clientPortalGetConfigs(search: $searchValue) {
      _id
      name
      description
      domain
      createdAt
      kind
      url
      __typename
    }
  }
`;

export const PAGES_ADD = gql`
  mutation PagesAdd($input: PageInput!) {
    cmsPagesAdd(input: $input) {
      _id
      __typename
    }
  }
`;

export const PAGES_EDIT = gql`
  mutation PagesEdit($_id: String!, $input: PageInput!) {
    cmsPagesEdit(_id: $_id, input: $input) {
      _id
      __typename
    }
  }
`;

export const PAGES_REMOVE = gql`
  mutation PagesRemove($id: String!) {
    cmsPagesRemove(_id: $id)
  }
`;

export const CMS_MENU_LIST = gql`
  query cmsMenuList(
    $clientPortalId: String
    $kind: String
    $language: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    cmsMenuList(
      clientPortalId: $clientPortalId
      kind: $kind
      language: $language
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      _id
      parentId
      label
      contentType
      contentTypeID
      kind
      icon
      url
      order
      target
      __typename
    }
  }
`;

export const GET_CLIENT_PORTALS = gql`
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
`;

export const CMS_CUSTOM_FIELD_GROUPS = gql`
  query cmsCustomFieldGroupList($clientPortalId: String!) {
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
        fields
      }
    }
  }
`;

export const CMS_CUSTOM_FIELD_GROUP_ADD = gql`
  mutation cmsCustomFieldGroupsAdd($input: CustomFieldGroupInput!) {
    cmsCustomFieldGroupsAdd(input: $input) {
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
      fields
    }
  }
`;

export const CMS_CUSTOM_FIELD_GROUP_EDIT = gql`
  mutation cmsCustomFieldGroupsEdit(
    $_id: String!
    $input: CustomFieldGroupInput!
  ) {
    cmsCustomFieldGroupsEdit(_id: $_id, input: $input) {
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
      fields
    }
  }
`;

export const CMS_CUSTOM_FIELD_GROUP_REMOVE = gql`
  mutation cmsCustomFieldGroupsRemove($_id: String!) {
    cmsCustomFieldGroupsRemove(_id: $_id)
  }
`;

export const CMS_CUSTOM_POST_TYPES = gql`
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
`;

export const CMS_CUSTOM_POST_TYPE_ADD = gql`
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
`;

export const CMS_CUSTOM_POST_TYPE_EDIT = gql`
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
`;

export const CMS_CUSTOM_POST_TYPE_REMOVE = gql`
  mutation cmsCustomPostTypesRemove($_id: String!) {
    cmsCustomPostTypesRemove(_id: $_id)
  }
`;

export const CMS_TRANSLATIONS = gql`
  query cmsTranslations($postId: String!) {
    cmsTranslations(postId: $postId) {
      _id
      postId
      language
      title
      content
      excerpt
      customFieldsData
    }
  }
`;

export const CMS_ADD_TRANSLATION = gql`
  mutation cmsAddTranslation($input: TranslationInput!) {
    cmsAddTranslation(input: $input) {
      _id
      postId
      language
      title
      content
      excerpt
      customFieldsData
    }
  }
`;

export const CMS_EDIT_TRANSLATION = gql`
  mutation cmsEditTranslation($input: TranslationInput!) {
    cmsEditTranslation(input: $input) {
      _id
      postId
      language
      title
      content
      excerpt
      customFieldsData
    }
  }
`;
