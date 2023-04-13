const filemanagerFileCreate = `
  mutation filemanagerFileCreate($type: String!, $name: String!, $folderId: String!, $url: String, $contentType: String, $contentTypeId: String, $documentId: String, $info: JSON) {
    filemanagerFileCreate(type: $type, name: $name, folderId: $folderId, url: $url, contentType: $contentType, contentTypeId: $contentTypeId, documentId: $documentId, info: $info) {
      _id
    }
  }
`;

const filemanagerRelateFilesContentType = `
  mutation filemanagerRelateFilesContentType($contentType: String!, $contentTypeId: String!, $fileIds: [String]) {
    filemanagerRelateFilesContentType(contentType: $contentType, contentTypeId: $contentTypeId, fileIds: $fileIds)
  }
`;

export default {
  filemanagerFileCreate,
  filemanagerRelateFilesContentType
};
