const documents = `
  query documents($page: Int, $perPage: Int) {
    documents(page: $page, perPage: $perPage) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

const documentsDetail = `
  query documentsDetail($_id: String!) {
    documentsDetail(_id: $_id) {
      _id
      contentType
      name
      content
      replacer
    }
  }
`;

const editorAttributes = `
  query documentsGetEditorAttributes($contentType: String!) {
    documentsGetEditorAttributes(contentType: $contentType) {
      value
      name
    }
  }
`;

const totalCount = `
  query documentsTotalCount {
    documentsTotalCount
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $config: JSON, $onlyDates: Boolean) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, config: $config, onlyDates: $onlyDates)
  }
`;

export default {
  documents,
  documentsDetail,
  editorAttributes,
  totalCount,
  fieldsCombinedByContentType
};
