import { gql } from '@apollo/client';

export const TAGS_QUERY = gql`
query TagsMain($type: String) {
  tagsMain(type: $type) {
    _id
    name
    colorCode
    parentId
    relatedIds
    isGroup
    description
    type
    order
    objectCount
    totalObjectCount
    createdAt
  }
}
`;

export const TAG_QUERY = gql`
  query TagBadge($id: String!) {
    tagDetail(_id: $id) {
      _id
      name
    }
  }
`;