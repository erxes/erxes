import { gql } from '@apollo/client';

/** Announcements — published CMS posts for this client portal. */
export const CMS_PORTAL_ANNOUNCEMENTS = gql`
  query cmsPortalAnnouncements($limit: Int, $searchValue: String) {
    cpPostList(status: published, limit: $limit, searchValue: $searchValue) {
      posts {
        _id
        title
        excerpt
        content
        slug
        publishedDate
        createdAt
        viewCount
      }
      totalCount
    }
  }
`;

/** One published announcement, addressed by slug. */
export const CMS_PORTAL_POST = gql`
  query cmsPortalPost($slug: String!) {
    cpPost(slug: $slug) {
      _id
      title
      excerpt
      content
      slug
      publishedDate
      createdAt
      viewCount
    }
  }
`;

/**
 * A single CMS page addressed by slug. The portal reads its copy (hero
 * headline, intro) from here so the wording is editable in the CMS.
 */
export const CMS_PORTAL_PAGE = gql`
  query cmsPortalPage($slug: String!) {
    cpCmsPageDetail(slug: $slug) {
      _id
      name
      description
      content
      slug
    }
  }
`;
