import { gql } from '@apollo/client';

export const CMS_CATEGORIES_ADD = gql`
  mutation CmsCategoriesAdd($input: PostCategoryInput!) {
    cmsCategoriesAdd(input: $input) {
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
