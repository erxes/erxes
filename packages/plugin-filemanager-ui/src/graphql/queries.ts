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
      parent {
        _id
        createdAt
        name
        parentId
      }
    }
  }
`;

export default {
  filemanagerFiles,
  filemanagerFolders
};
