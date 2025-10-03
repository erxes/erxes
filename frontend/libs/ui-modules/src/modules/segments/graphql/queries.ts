import gql from 'graphql-tag';

const SEGMENT_FIELDS = `
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
`;

export const FIELDS_COMBINED_BY_CONTENT_TYPE = gql(
  `
    query Fields($contentType: String!) {
      fieldsCombinedByContentType(contentType: $contentType)
    }
`,
);

export const SEGMENTS = gql(`
    query Segments($contentTypes: [String]!, $config: JSON, $ids: [String],$excludeIds: [String],$searchValue:String) {
      segments(contentTypes: $contentTypes, config: $config, ids: $ids,excludeIds:$excludeIds,searchValue:$searchValue) {
        _id
        color
        count
        contentType
        description
        name
        subOf
      }
}
`);

export const ASSOCIATION_TYPES = gql(`
  query GetAssociationTypes($contentType: String!) {
    segmentsGetAssociationTypes(contentType: $contentType)
  }
`);

export const SEGMENTS_GET_TYPES = gql`
  query SegmentsGetTypes {
    segmentsGetTypes
  }
`;

export const PROPERTIES_WITH_FIELDS = gql(`
    query Query($contentType: String!) {
      fieldsCombinedByContentType(contentType: $contentType)
      segmentsGetAssociationTypes(contentType: $contentType)
    }
`);

export const SEGMENT_DETAIL = gql`
  query segmentDetail($_id: String) {
    segmentDetail(_id: $_id) {
      ${SEGMENT_FIELDS}
      getSubSegments {
        ${SEGMENT_FIELDS}
      }
      subSegmentConditions
      {
        ${SEGMENT_FIELDS}
      }
    }
  }
`;

export const SEGMENTS_PREVIEW_COUNT = gql`
  query Query(
    $contentType: String!
    $conditions: JSON
    $subOf: String
    $config: JSON
    $conditionsConjunction: String
  ) {
    segmentsPreviewCount(
      contentType: $contentType
      conditions: $conditions
      subOf: $subOf
      config: $config
      conditionsConjunction: $conditionsConjunction
    )
  }
`;
