import gql from 'graphql-tag';

const PARAMS_DEFS = `
  $name: String,
  $description: String,
  $color: String,
  $root: JSON!,
  $visibility: SegmentVisibility
`;

const PARAMS = `
  name: $name,
  description: $description,
  color: $color,
  root: $root,
  visibility: $visibility
`;

const RESULT = `
  _id
  contentType
  name
  description
  color
  root
  visibility
  ownedBy
  status
  revision
`;

export const SEGMENT_REBUILD = gql`
  mutation SegmentsRebuild($_id: String!) {
    segmentsRebuild(_id: $_id)
  }
`;

export const SEGMENT_STOP_REBUILD = gql`
  mutation SegmentsStopRebuild($_id: String!) {
    segmentsStopRebuild(_id: $_id)
  }
`;

export const SEGMENT_ADD = gql`
  mutation SegmentsAdd($contentType: String!, $ownedBy: String, ${PARAMS_DEFS}) {
    segmentsAdd(contentType: $contentType, ownedBy: $ownedBy, ${PARAMS}) {
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
