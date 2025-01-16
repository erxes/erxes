import { gql } from '@apollo/client';

const PAGE_ADD = gql`
  mutation PagesAdd($input: PageInput!) {
    cmsPagesAdd(input: $input) {
      _id
    }
  }
`;

const PAGE_EDIT = gql`
  mutation PagesEdit($id: String!, $input: PageInput!) {
    cmsPagesEdit(_id: $id, input: $input) {
      _id
    }
  }
`;

const PAGE_REMOVE = gql`
  mutation PagesRemove($id: String!) {
    cmsPagesRemove(_id: $id)
  }
`;

export default {
  PAGE_ADD,
  PAGE_EDIT,
  PAGE_REMOVE,
};
