const historyPreviewCount = `
  query historyPreviewCount($segmentId: String, $contentType: String!) {
    historyPreviewCount(segmentId: $segmentId, contentType: $contentType)
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config)
  }
`;

const historyGetTypes = `
  query historyGetTypes($type: String) {
    historyGetTypes(type: $type)
  }
`;

export default {
  historyPreviewCount,
  fieldsCombinedByContentType,
  historyGetTypes
};
