import gql from 'graphql-tag';

const PARAMS_DEFS = `
  $name: String,
  $description: String,
  $subOf: String,
  $color: String,
  $conditions: [SegmentCondition],
  $conditionSegments: [SubSegment]
  $config: JSON,
  $conditionsConjunction: String
  $shouldWriteActivityLog: Boolean!
`;

const PARAMS = `
  name: $name,
  description: $description,
  subOf: $subOf,
  color: $color,
  conditions: $conditions,
  config: $config,
  conditionsConjunction: $conditionsConjunction
  conditionSegments: $conditionSegments
  shouldWriteActivityLog: $shouldWriteActivityLog
`;

export const SEGMENT_ADD = gql`
  mutation segmentsAdd($contentType: String!, ${PARAMS_DEFS}) {
    segmentsAdd(contentType: $contentType, ${PARAMS}) {
      _id
      count
    }
  }
`;

export const SEGMENT_EDIT = gql`
  mutation segmentsEdit($_id: String!, ${PARAMS_DEFS}) {
    segmentsEdit(_id: $_id, ${PARAMS}) {
      _id
      count
    }
  }
`;

export const SEGMENT_REMOVE = gql`
  mutation SegmentsRemove($id: String, $ids: [String]) {
    segmentsRemove(_id: $id, ids: $ids)
  }
`;
