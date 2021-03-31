const paramDefs = `
  $name: String!,
  $description: String,
  $subOf: String,
  $color: String,
  $conditions: [SegmentCondition],
  $boardId: String,
  $pipelineId: String,
`;

const params = `
  name: $name,
  description: $description,
  subOf: $subOf,
  color: $color,
  conditions: $conditions,
  boardId: $boardId,
  pipelineId: $pipelineId,
`;

const segmentsAdd = `
  mutation segmentsAdd($contentType: String!, ${paramDefs}) {
    segmentsAdd(contentType: $contentType, ${params}) {
      _id
    }
  }
`;

const segmentsEdit = `
  mutation segmentsEdit($_id: String!, ${paramDefs}) {
    segmentsEdit(_id: $_id, ${params}) {
      _id
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
