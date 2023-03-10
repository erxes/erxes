import { unitField } from '@erxes/ui/src/team/graphql/queries';

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

const filemanagerFileDetail = `
  query filemanagerFileDetail($_id: String!) {
    filemanagerFileDetail(_id: $_id) {
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
      sharedUsers {
        _id
        username
        email
        details {
          firstName
          lastName
          fullName
          avatar
        }
      }
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
        _id
        username
        email
        details {
          firstName
          lastName
          fullName
          avatar
        }
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

export default {
  filemanagerFiles,
  filemanagerFolders,
  filemanagerLogs,
  filemanagerFileDetail,
  filemanagerFolderDetail,
  documents,
  units
};
