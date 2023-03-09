const filemanagerFiles = `
  query filemanagerFiles($folderId: String!, $search: String) {
    filemanagerFiles(folderId: $folderId, search: $search) {
      _id
      contentType
      contentTypeId
      createdAt
      createdUserId
      documentId
      folderId
      info
      name
      type
      url
    }
  }
`;

const filemanagerFolders = `
  query filemanagerFolders($parentId: String) {
    filemanagerFolders(parentId: $parentId) {
      _id
      createdAt
      createdUserId
      parentId
      name
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

export default {
  filemanagerFiles,
  filemanagerFolders,
  documents
};
