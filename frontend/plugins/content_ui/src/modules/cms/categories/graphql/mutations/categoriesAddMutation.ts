import { gql } from '@apollo/client';

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
