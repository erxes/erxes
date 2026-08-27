import gql from 'graphql-tag';

const PARAMS_DEFS = `
  $name: String!,
  $description: String,
  $color: String,
  $root: JSON!,
  $visibility: SegmentVisibility,
  $executionMode: SegmentExecutionMode
`;

const PARAMS = `
  name: $name,
  description: $description,
  color: $color,
  root: $root,
  visibility: $visibility,
  executionMode: $executionMode
`;

const RESULT = `
  _id
  contentType
  name
  description
  color
  root
  visibility
  executionMode
  status
  revision
`;

export const SEGMENT_ADD = gql`
  mutation SegmentsAdd($contentType: String!, ${PARAMS_DEFS}) {
    segmentsAdd(contentType: $contentType, ${PARAMS}) {
      ${RESULT}
    }
  }
`;

export const SEGMENT_EDIT = gql`
  mutation SegmentsEdit($_id: String!, ${PARAMS_DEFS}) {
    segmentsEdit(_id: $_id, ${PARAMS}) {
      ${RESULT}
    }
  }
`;

export const SEGMENT_REMOVE = gql`
  mutation SegmentsRemove($ids: [String!]!) {
    segmentsRemove(ids: $ids)
  }
`;
