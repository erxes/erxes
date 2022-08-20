export const types = `
  input EventAttributeFilter {
    name: String,
    operator: String,
    value: String,
  }

  input SubSegment {
    _id: String
    contentType: String
    conditions: JSON
    conditionsConjunction: String

    config: JSON
  }

  input SegmentCondition {
    type: String,

    propertyType: String,
    propertyName: String,
    propertyOperator: String,
    propertyValue: String,

    eventName: String,
    eventOccurence: String,
    eventOccurenceValue: Float,
    eventAttributeFilters: [EventAttributeFilter],

    subSegmentId: String

    config: JSON
  }

  type Segment @key(fields: "_id") {
    _id: String!
    contentType: String!
    name: String
    description: String
    subOf: String
    color: String
    conditions: JSON
    conditionsConjunction: String
    shouldWriteActivityLog: Boolean

    getSubSegments: [Segment]
    subSegmentConditions: [Segment]
    
    config: JSON

    count: Int
  }
`;

export const queries = `
  segmentsGetTypes: [JSON]
  segmentsGetAssociationTypes(contentType: String!): [JSON]
  segments(contentTypes: [String]!, config: JSON): [Segment]
  segmentDetail(_id: String): Segment
  segmentsGetHeads: [Segment]
  segmentsEvents(contentType: String!): [JSON]
  segmentsPreviewCount(contentType: String!, conditions: JSON, subOf: String, config: JSON, conditionsConjunction: String): Int
`;

const commonFields = `
  name: String,
  description: String,
  subOf: String,
  color: String,
  conditions: [SegmentCondition],
  config: JSON
  conditionsConjunction: String
  conditionSegments: [SubSegment]
  shouldWriteActivityLog: Boolean!
`;

export const mutations = `
  segmentsAdd(contentType: String!, ${commonFields}): Segment
  segmentsEdit(_id: String!, ${commonFields}): Segment
  segmentsRemove(_id: String!): JSON
`;
