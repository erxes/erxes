import { gql } from 'apollo-server-express';

const typeDefs = gql`
  scalar JSON
  scalar Date

  type FileManagerFolder {
    _id: String!
    createdAt: Date
    createdUserId: String
    name: String!
    parentId: String
    parent: FileManagerFolder
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
  }

  extend type Query {
    filemanagerFolders(parentId: String): [FileManagerFolder]
    filemanagerFiles(folderId: String!, search: String): [FileManagerFile]
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
      contentType: String
      contentTypeId: String
      documentId: String
    ): FileManagerFile

    filemanagerFileRemove(_id: String!): JSON
  }
`;

export default typeDefs;
