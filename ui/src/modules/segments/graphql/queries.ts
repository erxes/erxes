const segmentFields = `
  _id
  contentType
  name
  description
  subOf
  color
  conditions

  boardId
  pipelineId
`;

const segments = `
  query segments($contentTypes: [String]!, $boardId: String, $pipelineId: String) {
    segments(contentTypes: $contentTypes, boardId: $boardId, pipelineId: $pipelineId) {
      ${segmentFields}

      getSubSegments {
        ${segmentFields}
      }
    }
  }
`;

const segmentDetail = `
  query segmentDetail($_id: String) {
    segmentDetail(_id: $_id) {
      ${segmentFields}
      getSubSegments {
        ${segmentFields}
      }
    }
  }
`;
const segmentsPreviewCount = `
  query segmentsPreviewCount($contentType: String!, $conditions: JSON, $subOf: String, $boardId: String, $pipelineId: String) {
    segmentsPreviewCount(contentType: $contentType, conditions: $conditions, subOf: $subOf, boardId: $boardId, pipelineId: $pipelineId)
  }
`;

const headSegments = `
  query headSegments {
    segmentsGetHeads {
      ${segmentFields}
      getSubSegments {
        ${segmentFields}
      }
    }
  }
`;

const events = `
  query events($contentType: String!) {
    segmentsEvents(contentType: $contentType)
  }
`;

export default {
  segments,
  segmentDetail,
  headSegments,
  events,
  segmentsPreviewCount
};
