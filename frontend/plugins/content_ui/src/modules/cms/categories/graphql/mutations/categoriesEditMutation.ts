import { gql } from '@apollo/client';

export const CMS_CATEGORIES_EDIT = gql`
  mutation cmsCategoryEdit($_id: String!, $input: PostCategoryInput!) {
    cmsCategoriesEdit(_id: $_id, input: $input) {
      _id
      clientPortalId
      name
      slug
      description
      parentId
      status
      customFieldsData
      translations {
        language
        title
        content
      }
      __typename
    }
  }
`;
