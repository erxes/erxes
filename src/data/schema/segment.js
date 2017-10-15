export const types = `
  input SegmentCondition {
    field: String,
    operator: String,
    value: String,
    dateUnit: String,
    type: String,
  }

  type Segment {
    _id: String!
    contentType: String!
    name: String!
    description: String
    subOf: String
    color: String
    connector: String
    conditions: JSON

    getParentSegment: Segment
    getSubSegments: [Segment]
  }
`;

export const queries = `
  segments(contentType: String!): [Segment]
  segmentDetail(_id: String): Segment
  segmentsGetHeads: [Segment]
`;

const commonFields = `
  contentType: String!,
  name: String!,
  description: String,
  subOf: String,
  color: String,
  connector: String,
  conditions: SegmentCondition
`;

export const mutations = `
  segmentsAdd(${commonFields}): Segment
  segmentsEdit(_id: String!, ${commonFields}): Segment
  segmentsRemove(_id: String!): Segment
`;
