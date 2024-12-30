import { gql } from '@apollo/client';

const TAG_ADD = gql`
mutation CmsTagsAdd($input: PostTagInput!) {
  cmsTagsAdd(input: $input) {
    _id
  }
}
`;

const TAG_EDIT = gql`
mutation CmsTagsEdit($id: String!, $input: PostTagInput!) {
  cmsTagsEdit(_id: $id, input: $input) {
    _id
  }
}
`;

const TAG_REMOVE = gql`
mutation CmsTagsRemove($id: String!) {
  cmsTagsRemove(_id: $id)
}
`;

export default {
  TAG_ADD,
  TAG_EDIT,
  TAG_REMOVE,
};
