export const types = `
  input EventAttributeFilter {
    name: String,
    operator: String,
    value: String,
  }

  input SegmentCondition {
    type: String,

    propertyName: String,
    propertyOperator: String,
    propertyValue: String,

    eventName: String,
    eventOccurence: String,
    eventOccurenceValue: Float,
    eventAttributeFilters: [EventAttributeFilter],
  }

  type Segment {
    _id: String!
    contentType: String!
    name: String!
    description: String
    subOf: String
    color: String
    conditions: JSON

    getSubSegments: [Segment]
  }
`;

export const queries = `
  segments(contentTypes: [String]!): [Segment]
  segmentDetail(_id: String): Segment
  segmentsGetHeads: [Segment]
  segmentsEvents(contentType: String!): [JSON]
  segmentsPreviewCount(contentType: String!, conditions: JSON, subOf: String): Int
`;

const commonFields = `
  name: String!,
  description: String,
  subOf: String,
  color: String,
  conditions: [SegmentCondition]
`;

export const mutations = `
  segmentsAdd(contentType: String!, ${commonFields}): Segment
  segmentsEdit(_id: String!, ${commonFields}): Segment
  segmentsRemove(_id: String!): JSON
`;
