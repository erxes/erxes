import { gql } from '@apollo/client';

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
