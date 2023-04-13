const fileFields = `
  _id
  contentType
  contentTypeId
  documentId
  folderId
  name
  type
  url
`;

const filemanagerFiles = `
  query filemanagerFiles($folderId: String!, $search: String, $type: String, $contentType: String, $contentTypeId: String, $createdAtFrom: String, $createdAtTo: String, $sortField: String, $sortDirection: Int) {
    filemanagerFiles(folderId: $folderId, search: $search, type: $type, contentType: $contentType, contentTypeId: $contentTypeId, createdAtFrom: $createdAtFrom, createdAtTo: $createdAtTo, sortField: $sortField, sortDirection: $sortDirection) {
      ${fileFields}
    }
  }
`;

const filemanagerFolders = `
  query filemanagerFolders($parentId: String, $isTree: Boolean) {
    filemanagerFolders(parentId: $parentId, isTree: $isTree) {
      _id
      createdAt
      createdUserId
      parentId
      name
      order
      hasChild
      parent {
        _id
        createdAt
        name
        parentId
      }
    }
  }
`;

const documents = `
  query documents($page: Int, $perPage: Int, $contentType: String, $limit: Int) {
    documents(page: $page, perPage: $perPage, contentType: $contentType, limit: $limit) {
      _id
      contentType
      name
      createdAt
    }
  }
`;

const filemanagerGetRelatedFilesContentType = `
  query filemanagerGetRelatedFilesContentType($contentType: String!, $contentTypeId: String!) {
    filemanagerGetRelatedFilesContentType(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      contentType
      contentTypeId
      fileIds
      files {
        _id
        name
        folderId
      }
    }
  }
`;

export default {
  filemanagerFiles,
  filemanagerFolders,
  filemanagerGetRelatedFilesContentType,
  documents
};
