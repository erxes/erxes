import { gql } from '@apollo/client';

export const CMS_CATEGORIES_REMOVE = gql`
  mutation cmsCategoryRemove($id: String!) {
    cmsCategoriesRemove(_id: $id)
  }
`;
