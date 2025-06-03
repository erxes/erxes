import { gql } from '@apollo/client';

const POST_ADD = gql`
mutation PostsAdd($input: PostInput!) {
  cmsPostsAdd(input: $input) {
    _id
  }
}
`;

const POST_EDIT = gql`
mutation PostsEdit($id: String!, $input: PostInput!) {
  cmsPostsEdit(_id: $id, input: $input) {
    _id
  }
}
`;

const POST_REMOVE = gql`
mutation PostsDelete($id: String!) {
  cmsPostsRemove(_id: $id)
}
`;

const ADD_TRANSLATION = gql`
mutation CmsPostsAddTranslation($input: PostTranslationInput!) {
  cmsPostsAddTranslation(input: $input) {
    _id
  }
}
`;

const EDIT_TRANSLATION = gql`
mutation CmsPostsEditTranslation( $input: PostTranslationInput!) {
  cmsPostsEditTranslation(input: $input) {
    _id
  }
}
`;

export default {
  POST_ADD,
  POST_EDIT,
  POST_REMOVE,
  ADD_TRANSLATION,
  EDIT_TRANSLATION,
};
