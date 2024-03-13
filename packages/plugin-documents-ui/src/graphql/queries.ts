const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String, $subType: String, $searchValue: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType, subType: $subType, searchValue: $searchValue) {
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
  query documentsTotalCount($contentType: String, $searchValue: String) {
    documentsTotalCount(contentType: $contentType, searchValue: $searchValue)
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
