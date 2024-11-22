import { gql } from '@apollo/client';

const POST_ADD = gql`
mutation PostsAdd($input: PostInput!) {
  postsAdd(input: $input) {
    _id
  }
}
`;

const POST_EDIT = gql`
mutation PostsEdit($id: String!, $input: PostInput!) {
  postsEdit(_id: $id, input: $input) {
    _id
  }
}
`;

const POST_REMOVE = gql`
mutation PostsDelete($id: String!) {
  postsDelete(_id: $id)
}
`;

export default {
  POST_ADD,
  POST_EDIT,
  POST_REMOVE,
};
