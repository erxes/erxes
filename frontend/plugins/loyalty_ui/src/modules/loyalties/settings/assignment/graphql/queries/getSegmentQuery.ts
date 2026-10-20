import { gql } from '~/gql';

export const GET_SEGMENT = gql(`
  query Segments(
    $contentTypes: [String]!
    $excludeIds: [String]
    $ids: [String]
    $searchValue: String
  ) {
    segments(
      contentTypes: $contentTypes
      excludeIds: $excludeIds
      ids: $ids
      searchValue: $searchValue
    ) {
      _id
      contentType
      name
      description
      color
    }
  }
`);
