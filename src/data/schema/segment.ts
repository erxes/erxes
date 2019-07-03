export const types = `
  input SegmentCondition {
    field: String,
    operator: String,
    value: String,
    dateUnit: String,
    type: String,
    brandId: String
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

    getSubSegments: [Segment]
  }
`;

export const queries = `
  segments(contentType: String!): [Segment]
  segmentDetail(_id: String): Segment
  segmentsGetHeads: [Segment]
`;

const commonFields = `
  name: String!,
  description: String,
  subOf: String,
  color: String,
  connector: String,
  conditions: [SegmentCondition]
`;

export const mutations = `
  segmentsAdd(contentType: String!, ${commonFields}): Segment
  segmentsEdit(_id: String!, ${commonFields}): Segment
  segmentsRemove(_id: String!): JSON
`;
