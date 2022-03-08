const segmentFields = `
  _id
  contentType
  name
  description
  subOf
  color
  conditions
  conditionsConjunction
  shouldWriteActivityLog

  boardId
  pipelineId
`;

const getTypes = `
  query segmentsGetTypes {
    segmentsGetTypes
  }
`;

const getAssociationTypes = `
  query segmentsGetAssociationTypes($contentType: String!) {
    segmentsGetAssociationTypes(contentType: $contentType)
  }
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
      subSegmentConditions
      {
        ${segmentFields}
      }
    }
  }
`;
const segmentsPreviewCount = `
  query segmentsPreviewCount($contentType: String!, $conditions: JSON, $subOf: String, $boardId: String, $pipelineId: String, $conditionsConjunction: String) {
    segmentsPreviewCount(contentType: $contentType, conditions: $conditions, subOf: $subOf, boardId: $boardId, pipelineId: $pipelineId, conditionsConjunction: $conditionsConjunction)
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

const combinedFields = `
  query fieldsCombinedByContentType($contentType: String!, $serviceType: String) {
    fieldsCombinedByContentType(contentType: $contentType, serviceType: $serviceType)
  }
`;

export default {
  getTypes,
  getAssociationTypes,
  segments,
  segmentDetail,
  headSegments,
  events,
  segmentsPreviewCount,
  combinedFields
};
