const paramDefs = `
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

const params = `
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

const segmentsAdd = `
  mutation segmentsAdd($contentType: String!, ${paramDefs}) {
    segmentsAdd(contentType: $contentType, ${params}) {
      _id
      count
    }
  }
`;

const segmentsEdit = `
  mutation segmentsEdit($_id: String!, ${paramDefs}) {
    segmentsEdit(_id: $_id, ${params}) {
      _id
      count
    }
  }
`;

const segmentsRemove = `
  mutation segmentsRemove($_id: String!) {
    segmentsRemove(_id: $_id)
  }
`;

export default {
  segmentsAdd,
  segmentsEdit,
  segmentsRemove
};
