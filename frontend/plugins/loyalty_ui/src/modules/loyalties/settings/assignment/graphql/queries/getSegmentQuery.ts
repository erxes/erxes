import { gql } from '@apollo/client';

export const GET_SEGMENT = gql`
  query Segments(
    $contentTypes: [String]!
    $config: JSON
    $excludeIds: [String]
    $ids: [String]
    $searchValue: String
  ) {
    segments(
      contentTypes: $contentTypes
      config: $config
      excludeIds: $excludeIds
      ids: $ids
      searchValue: $searchValue
    ) {
      _id
      contentType
      name
      description
      subOf
      color
      conditions
      conditionsConjunction
      shouldWriteActivityLog
      subSegmentConditions {
        _id
        contentType
        name
        description
        subOf
        color
        conditions
        conditionsConjunction
        shouldWriteActivityLog
        config
        count
      }
      config
      count
    }
  }
`;
