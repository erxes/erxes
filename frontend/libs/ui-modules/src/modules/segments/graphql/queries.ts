import gql from 'graphql-tag';

const SEGMENT_FIELDS = `
  _id
  contentType
  name
  description
  color
  root
  visibility
  ownerId
  executionMode
  status
  revision
  membersCount
  membersCountedAt
  buildStartedAt
  buildProcessed
`;

export const SEGMENTS = gql`
  query Segments(
    $contentTypes: [String]!
    $ids: [String]
    $excludeIds: [String]
    $searchValue: String
  ) {
    segments(
      contentTypes: $contentTypes
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
    ) {
      _id
      contentType
      name
      description
      color
      status
      membersCount
      buildProcessed
    }
  }
`;

export const SEGMENT_DETAIL = gql`
  query SegmentDetail($_id: String!) {
    segmentDetail(_id: $_id) {
      ${SEGMENT_FIELDS}
    }
  }
`;

export const SEGMENTS_GET_TYPES = gql`
  query SegmentsGetTypes {
    segmentsGetTypes
  }
`;

/** Filterable fields for a content type, as the owning plugin declares them. */
export const SEGMENT_FIELDS_QUERY = gql`
  query SegmentFields($contentType: String!) {
    segmentFields(contentType: $contentType) {
      key
      label
      kind
      input
      source
      options
      query
      component
      operators {
        value
        label
        input
      }
    }
  }
`;

/** Related entities a segment on this content type can reach. */
export const SEGMENT_RELATIONS = gql`
  query SegmentRelations($subjectType: String!) {
    segmentRelations(subjectType: $subjectType) {
      key
      label
      subjectType
      relatedType
      measureOperators {
        value
        label
        input
      }
    }
  }
`;

export const SEGMENTS_PREVIEW_COUNT = gql`
  query SegmentsPreviewCount($contentType: String!, $root: JSON!) {
    segmentsPreviewCount(contentType: $contentType, root: $root) {
      count
      unsupported
    }
  }
`;

export const SEGMENT_MEMBER_COUNT = gql`
  query SegmentMemberCount($segmentId: String!) {
    segmentMemberCount(segmentId: $segmentId) {
      count
      unsupported
    }
  }
`;

/** A segment's membership and movement per day, oldest first. */
export const SEGMENT_GROWTH = gql`
  query SegmentGrowth($segmentId: String!, $days: Int) {
    segmentGrowth(segmentId: $segmentId, days: $days) {
      date
      count
      joined
      left
    }
  }
`;

/** The segment already asking this, if one exists. */
export const SEGMENT_SAME_DEFINITION = gql`
  query SegmentSameDefinition(
    $contentType: String!
    $root: JSON!
    $excludeId: String
  ) {
    segmentSameDefinition(
      contentType: $contentType
      root: $root
      excludeId: $excludeId
    ) {
      _id
      name
    }
  }
`;
