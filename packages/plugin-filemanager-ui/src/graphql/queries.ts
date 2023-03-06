const filemanagerFiles = `
  query filemanagerFiles($folderId: String!) {
    filemanagerFiles(folderId: $folderId) {
      _id
      contentType
      contentTypeId
      createdAt
      createdUserId
      documentId
      folderId
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
    }
  }
`;

export default {
  filemanagerFiles,
  filemanagerFolders
};
