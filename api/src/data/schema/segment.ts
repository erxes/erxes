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

    boardId: String
    pipelineId: String
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

    boardId: String
    pipelineId: String

    formId: String
  }

  type Segment {
    _id: String!
    contentType: String!
    name: String
    description: String
    subOf: String
    color: String
    conditions: JSON
    conditionsConjunction: String
    shouldWriteActivityLog: Boolean!

    getSubSegments: [Segment]
    subSegmentConditions: [Segment]

    boardId: String
    pipelineId: String

    count: Int
  }
`;

export const queries = `
  segments(contentTypes: [String]!, boardId: String, pipelineId: String): [Segment]
  segmentDetail(_id: String): Segment
  segmentsGetHeads: [Segment]
  segmentsEvents(contentType: String!): [JSON]
  segmentsPreviewCount(contentType: String!, conditions: JSON, subOf: String, boardId: String, pipelineId: String, conditionsConjunction: String): Int
`;

const commonFields = `
  name: String,
  description: String,
  subOf: String,
  color: String,
  conditions: [SegmentCondition],
  boardId: String,
  pipelineId: String,
  conditionsConjunction: String
  conditionSegments: [SubSegment]
  shouldWriteActivityLog: Boolean!
`;

export const mutations = `
  segmentsAdd(contentType: String!, ${commonFields}): Segment
  segmentsEdit(_id: String!, ${commonFields}): Segment
  segmentsRemove(_id: String!): JSON
`;
