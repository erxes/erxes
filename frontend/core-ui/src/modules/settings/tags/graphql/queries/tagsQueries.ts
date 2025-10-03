import { gql } from '@apollo/client';

const GET_TAGS_TYPES = gql`
  query TagsGetTypes {
    tagsGetTypes
  }
`;

const GET_TAG_DETAIL = gql`
  query TagDetail($id: String!) {
    tagDetail(_id: $id) {
      _id
      colorCode
      name
      order
      parentId
      totalObjectCount
      objectCount
      type
    }
  }
`;

export { GET_TAGS_TYPES, GET_TAG_DETAIL };
