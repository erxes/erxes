import { unitField } from '@erxes/ui/src/team/graphql/queries';

const userFields = `
  _id
  username
  email
  details {
    firstName
    lastName
    fullName
    avatar
  }
`;

const fileFields = `
  _id
  contentType
  contentTypeId
  createdAt
  createdUserId
  documentId
  folderId
  info
  name
  permissionUnitId
  permissionUserIds
  relatedFiles {
   _id
   name
   info
   folderId
   documentId
   type
   url
  }
  relatedFileIds
  sharedUsers {
    ${userFields}
  }
  type
  url
`;

const ackFields = `
  _id
  createdAt
  description
  file {
    ${fileFields}
  }
  fileId
  fromUser {
    ${userFields}
  }
  fromUserId
  toUserId
  toUser {
    ${userFields}
  }
  status
`;

const filemanagerFiles = `
  query filemanagerFiles($folderId: String!, $search: String, $type: String, $contentType: String, $contentTypeId: String, $createdAtFrom: String, $createdAtTo: String, $sortField: String, $sortDirection: Int) {
    filemanagerFiles(folderId: $folderId, search: $search, type: $type, contentType: $contentType, contentTypeId: $contentTypeId, createdAtFrom: $createdAtFrom, createdAtTo: $createdAtTo, sortField: $sortField, sortDirection: $sortDirection) {
      ${fileFields}
    }
  }
`;

const filemanagerFoldersTree = `
  query filemanagerFolders($parentId: String, $isTree: Boolean) {
    filemanagerFolders(parentId: $parentId, isTree: $isTree) {
      _id
      parentId
      name
      order
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

const filemanagerFileDetail = `
  query filemanagerFileDetail($_id: String!) {
    filemanagerFileDetail(_id: $_id) {
      ${fileFields}
    }
  }
`;

const filemanagerFolderDetail = `
  query filemanagerFolderDetail($_id: String!) {
    filemanagerFolderDetail(_id: $_id) {
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
      sharedUsers {
        ${userFields}
      }
    }
  }
`;

const filemanagerLogs = `
  query filemanagerLogs($contentTypeId: String!) {
    filemanagerLogs(contentTypeId: $contentTypeId) {
      _id
      contentType
      contentTypeId
      createdAt
      userId
      user {
        ${userFields}
      }
      description
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

const units = `
  query units ($searchValue:String) {
    units (searchValue:$searchValue) {
      ${unitField}
    }
  }
`;

const filemanagerGetAccessRequests = `
  query filemanagerGetAccessRequests($fileId: String!) {
    filemanagerGetAccessRequests(fileId: $fileId) {
      _id
      createdAt
      description
      fileId
      file {
        ${fileFields}
      }
      fromUser {
        ${userFields}
      }
      fromUserId
      status
    }
  }
`;

const filemanagerGetAckRequestByUser = `
  query filemanagerGetAckRequestByUser($fileId: String!) {
    filemanagerGetAckRequestByUser(fileId: $fileId) {
      ${ackFields}
    }
  }
`;

const filemanagerGetAckRequests = `
  query filemanagerGetAckRequests($fileId: String!) {
    filemanagerGetAckRequests(fileId: $fileId) {
      ${ackFields}
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
  filemanagerFoldersTree,
  filemanagerLogs,
  filemanagerFileDetail,
  filemanagerFolderDetail,
  filemanagerGetAccessRequests,
  filemanagerGetAckRequestByUser,
  filemanagerGetAckRequests,
  filemanagerGetRelatedFilesContentType,
  documents,
  units
};
