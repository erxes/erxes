const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String, $subType: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType, subType: $subType) {
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
      subType
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

const documentsGetContentTypes = `
  query DocumentsGetContentTypes {
  documentsGetContentTypes {
    contentType
    label
    subTypes
  }
}
`;

export default {
  documents,
  documentsDetail,
  editorAttributes,
  totalCount,
  documentsGetContentTypes
};
