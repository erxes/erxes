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
