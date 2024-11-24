import { gql } from '@apollo/client';

const PAGE_ADD = gql`
mutation PagesAdd($input: PageInput!) {
  pagesAdd(input: $input) {
    _id
  }
}
`;

const PAGE_EDIT = gql`
  mutation CmsCategoriesEdit($_id: String!, $input: PostCategoryInput!) {
    cmsCategoriesEdit(_id: $_id, input: $input) {
      _id
      name
      slug
    }
  }
`;

const PAGE_REMOVE = gql`
  mutation CmsCategoriesRemove($id: String!) {
    cmsCategoriesRemove(_id: $id)
  }
`;

export default {
  PAGE_ADD,
  PAGE_EDIT,
  PAGE_REMOVE,
};
