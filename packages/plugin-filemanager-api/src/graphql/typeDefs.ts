import gql from 'graphql-tag';

const typeDefs = gql`
  scalar JSON
  scalar Date

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type FileManagerFolder {
    _id: String!
    createdAt: Date
    createdUserId: String
    name: String!
    order: String!
    parentId: String
    parent: FileManagerFolder
    permissionUserIds: [String]
    permissionUnitId: String
    hasChild: Boolean

    sharedUsers: [User]
  }

  type FileManagerFile {
    _id: String!
    createdAt: Date
    createdUserId: String
    name: String!
    type: String!
    folderId: String!
    url: String
    info: JSON
    contentType: String
    contentTypeId: String
    documentId: String

    permissionUserIds: [String]
    permissionUnitId: String

    sharedUsers: [User]

    relatedFileIds: [String]
    relatedFiles: [FileManagerFile]
  }

  type FileManagerLog {
    _id: String!
    createdAt: Date
    contentType: String
    contentTypeId: String
    userId: String
    description: String
    user: User
  }

  type FileManagerAckRequest {
    _id: String!
    createdAt: Date
    fileId: String
    fromUserId: String
    toUserId: String
    status: String
    description: String

    file: FileManagerFile
    fromUser: User
    toUser: User
  }

  type FileManagerAccessRequest {
    _id: String!
    createdAt: Date
    fileId: String
    file: FileManagerFile
    fromUserId: String
    fromUser: User
    status: String
    description: String
  }

  type FileManagerRelation {
    _id: String!
    contentType: String!
    contentTypeId: String!
    fileIds: [String]
    files: [FileManagerFile]
  }

  extend type Query {
    filemanagerFolders(parentId: String, isTree: Boolean): [FileManagerFolder]

    filemanagerFiles(
      folderId: String!
      search: String
      type: String
      contentType: String
      contentTypeId: String
      createdAtFrom: String
      createdAtTo: String
      sortField: String
      sortDirection: Int
    ): [FileManagerFile]

    filemanagerFileDetail(_id: String!): FileManagerFile
    filemanagerFolderDetail(_id: String!): FileManagerFolder
    filemanagerLogs(contentTypeId: String!): [FileManagerLog]
    filemanagerGetAckRequestByUser(fileId: String!): FileManagerAckRequest
    filemanagerGetAckRequests(fileId: String!): [FileManagerAckRequest]
    filemanagerGetAccessRequests(fileId: String!): [FileManagerAccessRequest]

    filemanagerGetRelatedFilesContentType(
      contentType: String!
      contentTypeId: String!
    ): [FileManagerRelation]
  }

  extend type Mutation {
    filemanagerFolderSave(
      _id: String
      name: String!
      parentId: String
    ): FileManagerFolder

    filemanagerFolderRemove(_id: String!): JSON

    filemanagerFileCreate(
      name: String!
      type: String!
      folderId: String!
      url: String
      info: JSON
      contentType: String
      contentTypeId: String
      documentId: String
    ): FileManagerFile

    filemanagerRelateFiles(sourceId: String!, targetIds: [String!]!): String

    filemanagerRemoveRelatedFiles(
      sourceId: String!
      targetIds: [String!]!
    ): String

    filemanagerFileRemove(_id: String!): JSON

    filemanagerChangePermission(
      type: String!
      _id: String!
      userIds: [String]
      unitId: String
    ): JSON

    filemanagerRequestAcks(fileId: String!, description: String): String

    filemanagerAckRequest(_id: String!): JSON

    filemanagerRequestAccess(fileId: String!, description: String): String
    filemanagerConfirmAccessRequest(requestId: String!): String
    filemanagerRelateFilesContentType(
      contentType: String!
      contentTypeId: String!
      fileIds: [String]
    ): String
  }
`;

export default typeDefs;
