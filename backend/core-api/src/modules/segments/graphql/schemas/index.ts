export const types = `
  enum SegmentVisibility { private organization }
  enum SegmentStatus { draft building active failed cancelled }

  type Segment @key(fields: "_id") {
    _id: ID!
    contentType: String!
    name: String!
    description: String
    color: String

    """The condition tree. See SegmentNode in erxes-api-shared."""
    root: JSON!

    visibility: SegmentVisibility!
    ownerId: String!

    status: SegmentStatus!
    revision: Int!

    """How many records the segmentation worker last settled as members. Absent
    until it has run, which is not the same as a count of zero."""
    membersCount: Int
    membersCountedAt: Date

    """Set only while a rebuild is running. There is no total to compare to."""
    buildStartedAt: Date
    buildProcessed: Int
    buildTotal: Int
    buildCancelRequested: Boolean

    createdBy: String!
    updatedBy: String
    createdAt: Date!
    updatedAt: Date!
  }

  type SegmentMemberCount {
    count: Int!
    """Parts of the tree the query could not express, so the count is narrower."""
    unsupported: [String!]
    """The count gave up before finishing, so the number is not the answer."""
    exceeded: Boolean
  }

  """One day of a segment's life: where it ended, and what moved it there."""
  type SegmentDay {
    """Start of the bucket this point covers - hourly on a short window."""
    at: Date
    date: String!
    """Closing membership. Absent on days the worker never settled it."""
    count: Int
    joined: Int!
    left: Int!
  }

  type SegmentMemberPage {
    ids: [String!]!
    nextCursor: String
    unsupported: [String!]
  }

  type SegmentOperator {
    value: String!
    label: String!
    """What the operator needs from the user: none, field or number."""
    input: String!
    """Shown under the row where the label alone would be read wrong."""
    hint: String
  }

  type SegmentRelation {
    key: String!
    label: String!
    subjectType: String!
    relatedType: String!
    """Operators a count or sum of this relation is compared with."""
    measureOperators: [SegmentOperator!]!
  }

  type SegmentField {
    key: String!
    label: String!
    operators: [SegmentOperator!]!
    kind: String!
    input: String!
    source: String
    options: JSON
    query: JSON
    component: String
  }
`;

export const queries = `
  segmentsGetTypes: [JSON]
  segments(contentTypes: [String]!, ids: [String], excludeIds: [String], searchValue: String): [Segment]
  segmentDetail(_id: String!): Segment

  """Filterable fields for a content type, including tenant custom properties."""
  segmentFields(contentType: String!): [SegmentField!]!

  """Related entities a segment on this content type can reach."""
  segmentRelations(subjectType: String!): [SegmentRelation!]!

  """How many records a tree would match, for the form's live count."""
  segmentsPreviewCount(contentType: String!, root: JSON!): SegmentMemberCount!

  """The segment already asking this, if one exists."""
  segmentSameDefinition(
    contentType: String!
    root: JSON!
    excludeId: String
  ): Segment

  segmentMembers(segmentId: String!, cursor: String, limit: Int): SegmentMemberPage!
  segmentMemberCount(segmentId: String!): SegmentMemberCount!

  """A segment's membership and movement per day, oldest first."""
  segmentGrowth(segmentId: String!, days: Int): [SegmentDay!]!
`;

const commonFields = `
  name: String!
  description: String
  color: String
  root: JSON!
  visibility: SegmentVisibility
  status: SegmentStatus
`;

export const mutations = `
  segmentsAdd(contentType: String!, ${commonFields}): Segment
  segmentsEdit(_id: String!, ${commonFields}): Segment
  segmentsRemove(ids: [String!]!): JSON
  segmentsRebuild(_id: String!): JSON
  segmentsStopRebuild(_id: String!): JSON
`;
