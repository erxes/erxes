import { gql } from '@apollo/client';

export const POST_CMS_EDIT = gql`
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
      customFieldsData
      customFieldsMap
      tags {
        _id
        clientPortalId
        name
        slug
        colorCode
        createdAt
        updatedAt
      }
    }
  }
`;
