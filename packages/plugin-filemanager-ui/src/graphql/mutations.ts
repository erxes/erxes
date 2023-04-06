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

const filemanagerChangePermission = `
  mutation filemanagerChangePermission($type: String!, $_id: String!, $userIds: [String], $unitId: String) {
    filemanagerChangePermission(type: $type, _id: $_id, userIds: $userIds, unitId: $unitId)
  }
`;

const filemanagerRelateFiles = `
  mutation filemanagerRelateFiles($sourceId: String!, $targetIds: [String!]!) {
    filemanagerRelateFiles(sourceId: $sourceId, targetIds: $targetIds)
  }
`;

const filemanagerRemoveRelatedFiles = `
  mutation filemanagerRemoveRelatedFiles($sourceId: String!, $targetIds: [String!]!) {
    filemanagerRemoveRelatedFiles(sourceId: $sourceId, targetIds: $targetIds)
  }
`;

const filemanagerRequestAccess = `
  mutation filemanagerRequestAccess($fileId: String!, $description: String) {
    filemanagerRequestAccess(fileId: $fileId, description: $description)
  }
`;

const filemanagerRequestAcks = `
  mutation filemanagerRequestAcks($fileId: String!) {
    filemanagerRequestAcks(fileId: $fileId)
  }
`;

const filemanagerConfirmAccessRequest = `
  mutation filemanagerConfirmAccessRequest($requestId: String!) {
    filemanagerConfirmAccessRequest(requestId: $requestId)
  }
`;

export default {
  filemanagerFolderSave,
  filemanagerFolderRemove,
  filemanagerFileCreate,
  filemanagerFileRemove,
  filemanagerChangePermission,
  filemanagerRelateFiles,
  filemanagerRemoveRelatedFiles,
  filemanagerRequestAccess,
  filemanagerRequestAcks,
  filemanagerConfirmAccessRequest
};
