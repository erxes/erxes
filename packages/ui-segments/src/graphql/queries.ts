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

  config
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
  query segments($contentTypes: [String]!, $config: JSON) {
    segments(contentTypes: $contentTypes, config: $config) {
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
  query segmentsPreviewCount($contentType: String!, $conditions: JSON, $subOf: String, $config: JSON, $conditionsConjunction: String) {
    segmentsPreviewCount(contentType: $contentType, conditions: $conditions, subOf: $subOf, config: $config, conditionsConjunction: $conditionsConjunction)
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
  query fieldsCombinedByContentType($contentType: String!) {
    fieldsCombinedByContentType(contentType: $contentType)
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
