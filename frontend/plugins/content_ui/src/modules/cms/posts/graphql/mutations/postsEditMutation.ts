import { gql } from '@apollo/client';

export const POSTS_EDIT = gql`
  mutation CmsPostsEdit($id: String!, $input: PostInput!) {
    cmsPostsEdit(_id: $id, input: $input) {
      _id
      type
      customPostType {
        _id
        clientPortalId
        code
        label
        pluralLabel
        description
        createdAt
      }
      authorKind
      authorId
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
      publishedDate
      autoArchiveDate
      reactions
      reactionCounts
      images {
        url
        name
        type
        size
        duration
      }
      video {
        url
        name
        type
        size
        duration
      }
      videoUrl
      createdAt
      updatedAt
      categories {
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
      customFieldsData
      customFieldsMap
    }
  }
`;
