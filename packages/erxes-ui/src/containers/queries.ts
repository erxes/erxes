const combinedFields = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON, $onlyDates: Boolean) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config, onlyDates: $onlyDates)
  }
`;

export default {
  combinedFields
};
