import { gql } from '@apollo/client';

export const CMS_CATEGORIES_REMOVE = gql`
  mutation CmsCategoriesRemove($id: String!) {
    cmsCategoriesRemove(_id: $id)
  }
`;
