import { gql } from '@apollo/client';

export const MENU_PAGES_QUERY = gql`
  query MenuPages($clientPortalId: String!, $limit: Int) {
    cmsPageList(clientPortalId: $clientPortalId, limit: $limit) {
      pages {
        _id
        name
        slug
      }
    }
  }
`;

export const MENU_POSTS_QUERY = gql`
  query MenuPosts($clientPortalId: String!, $limit: Int, $type: String) {
    cmsPostList(clientPortalId: $clientPortalId, limit: $limit, type: $type) {
      posts {
        _id
        title
        slug
      }
    }
  }
`;

export const MENU_CUSTOM_TYPES_QUERY = gql`
  query MenuCustomTypes($clientPortalId: String) {
    cmsCustomPostTypes(clientPortalId: $clientPortalId) {
      _id
      code
      label
    }
  }
`;

export const MENU_CATEGORIES_QUERY = gql`
  query MenuCategories($clientPortalId: String!, $limit: Int) {
    cmsCategories(clientPortalId: $clientPortalId, limit: $limit) {
      list {
        _id
        name
        slug
      }
    }
  }
`;

export const MENU_TAGS_QUERY = gql`
  query MenuTags($clientPortalId: String, $language: String) {
    cmsTags(clientPortalId: $clientPortalId, language: $language) {
      tags {
        _id
        name
        slug
      }
    }
  }
`;

export const MENU_DETECT_QUERY = gql`
  query MenuDetect($clientPortalId: String!, $limit: Int) {
    cmsPageList(clientPortalId: $clientPortalId, limit: $limit) {
      pages {
        _id
        slug
      }
    }
    cmsPostList(clientPortalId: $clientPortalId, limit: $limit) {
      posts {
        _id
        slug
        customPostType {
          _id
        }
      }
    }
  }
`;
