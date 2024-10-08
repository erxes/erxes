import { gql } from '@apollo/client';

const CATEGORY_ADD = gql`
  mutation CmsCategoriesAdd($input: PostCategoryInput!) {
    cmsCategoriesAdd(input: $input) {
      _id
    }
  }
`;

const CATEGORY_EDIT = gql`
  mutation CmsCategoriesEdit($_id: String!, $input: PostCategoryInput!) {
    cmsCategoriesEdit(_id: $_id, input: $input) {
      _id
      name
      slug
    }
  }
`;

const CATEGORY_REMOVE = gql`
  mutation CmsCategoriesRemove($id: String!) {
    cmsCategoriesRemove(_id: $id)
  }
`;

export default {
  CATEGORY_ADD,
  CATEGORY_EDIT,
  CATEGORY_REMOVE,
};
