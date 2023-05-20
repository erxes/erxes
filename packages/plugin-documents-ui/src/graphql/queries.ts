import { isEnabled } from '@erxes/ui/src/utils/core';

const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String, $tag: String) {
    documents(page: $page, perPage: $perPage, contentType: $contentType, tag: $tag) {
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
      ${
        isEnabled('tags')
          ? `tags {
        _id
        name
        colorCode
      }`
          : ''
      }
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
