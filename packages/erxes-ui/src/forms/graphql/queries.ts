const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $pipelineId: String, $formId: String) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, pipelineId: $pipelineId, formId: $formId)
  }
`;
export default {
  fieldsCombinedByContentType
};
