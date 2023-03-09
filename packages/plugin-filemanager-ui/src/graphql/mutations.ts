const filemanagerFolderSave = `
  mutation filemanagerFolderSave($_id: String, $name: String!, $parentId: String) {
    filemanagerFolderSave(_id: $_id, name: $name, parentId: $parentId) {
      _id
    }
  }
`;

const filemanagerFolderRemove = `
  mutation filemanagerFolderRemove($_id: String!) {
    filemanagerFolderRemove(_id: $_id)
  }
`;

const filemanagerFileCreate = `
  mutation filemanagerFileCreate($type: String!, $name: String!, $folderId: String!, $url: String, $contentType: String, $contentTypeId: String, $documentId: String, $info: JSON) {
    filemanagerFileCreate(type: $type, name: $name, folderId: $folderId, url: $url, contentType: $contentType, contentTypeId: $contentTypeId, documentId: $documentId, info: $info) {
      _id
    }
  }
`;

const filemanagerFileRemove = `
  mutation filemanagerFileRemove($_id: String!) {
    filemanagerFileRemove(_id: $_id)
  }
`;

export default {
  filemanagerFolderSave,
  filemanagerFolderRemove,
  filemanagerFileCreate,
  filemanagerFileRemove
};
