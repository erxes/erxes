import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

// Float: GraphQL Int is 32-bit and files exceed 2 GB.
export const types = `
  type File {
    _id: String!
    folderId: String
    name: String!
    ext: String
    mimeType: String!
    size: Float!
    status: String!
    currentVersionId: String
    previewStatus: String
    thumbnailUrl: String
    myRole: String
    access: [FilesAccessGrant]
    inheritedAccess: [FilesAccessGrant]
    sharedWith: [FilesAccessGrant]
    publicLink: Boolean
    createdBy: String
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
    deletedBy: String
  }

  type FilesFolderAppearance {
    color: String
    icon: String
    coverFileId: String
  }

  type FilesAccessGrant {
    type: String!
    id: String
    role: String!
  }

  input FilesAccessGrantInput {
    type: String!
    id: String
    role: String!
  }

  type FilesSpaces {
    myRootId: String!
    orgRootId: String!
  }

  type FilesFolder {
    _id: String!
    name: String!
    parentId: String
    ancestorIds: [String]
    appearance: FilesFolderAppearance
    coverUrl: String
    myRole: String
    space: String
    sharedWith: [FilesAccessGrant]
    access: [FilesAccessGrant]
    inheritedAccess: [FilesAccessGrant]
    restricted: Boolean
    createdBy: String
    createdAt: Date
    deletedAt: Date
    deletedBy: String
  }

  type FilesVersion {
    _id: String!
    fileId: String!
    version: Int!
    size: Float!
    mimeType: String!
    previewStatus: String
    createdBy: String
    createdAt: Date
  }

  type FilesPinned {
    files: [File]
    folders: [FilesFolder]
  }

  type FilesSharedWithMe {
    folders: [FilesFolder]
    files: [File]
  }

  # The client builds the link from its own API URL, as read-file links are.
  type FilesShare {
    _id: String!
    fileId: String!
    token: String!
    createdAt: Date
  }

  type FilesListResponse {
    list: [File]
    pageInfo: PageInfo
    totalCount: Int
  }

  type FilesTrash {
    files: [File]
    folders: [FilesFolder]
  }

  type FilesUsage {
    usedBytes: Float!
    reservedBytes: Float!
    quotaBytes: Float
    maxFileSize: Float!
  }

  type FilesSignedPart {
    partNumber: Int!
    url: String!
  }

  type FilesUploadSession {
    uploadId: String!
    fileId: String!
    partSize: Float!
    totalParts: Int!
    singleUploadUrl: String
    parts: [FilesSignedPart!]!
  }

  type FilesUploadResume {
    uploadId: String!
    partSize: Float!
    totalParts: Int!
    uploadedPartNumbers: [Int!]!
  }
`;

export const queries = `
  filesSpaces: FilesSpaces
  filesSharedWithMe: FilesSharedWithMe
  filesList(folderId: String, searchValue: String, ${GQL_CURSOR_PARAM_DEFS}): FilesListResponse
  filesDetail(_id: String!): File
  filesByIds(_ids: [String!]!): [File]
  filesFolders(parentId: String): [FilesFolder]
  filesFolderDetail(_id: String!): FilesFolder
  filesFolderPath(_id: String!): [FilesFolder]
  filesTrash: FilesTrash
  filesUsage: FilesUsage
  filesDownloadUrl(_id: String!, versionId: String, inline: Boolean, viewer: Boolean): String!
  filesVersions(fileId: String!): [FilesVersion]
  filesPins: FilesPinned
  filesShare(fileId: String!): FilesShare
`;

const itemIds = `fileIds: [String], folderIds: [String]`;

export const mutations = `
  filesUploadStart(name: String!, size: Float!, mimeType: String, folderId: String, replaceFileId: String): FilesUploadSession!
  filesVersionRestore(fileId: String!, versionId: String!): File
  filesPin(itemType: String!, itemId: String!): Boolean
  filesPinMany(${itemIds}): Boolean
  filesFolderAppearanceMany(_ids: [String!]!, color: String, icon: String, coverFileId: String): Boolean
  filesAccessAdd(${itemIds}, access: [FilesAccessGrantInput!]!): Boolean
  filesUnpin(itemType: String!, itemId: String!): Boolean
  filesFolderAppearance(_id: String!, color: String, icon: String, coverFileId: String): FilesFolder
  filesFolderAccessUpdate(_id: String!, access: [FilesAccessGrantInput!]!, restricted: Boolean): FilesFolder
  filesFileAccessUpdate(_id: String!, access: [FilesAccessGrantInput!]!): File
  filesShareCreate(fileId: String!): FilesShare
  filesShareRevoke(fileId: String!): Boolean
  filesUploadSignParts(uploadId: String!, from: Int!, to: Int!): [FilesSignedPart!]!
  filesUploadResume(uploadId: String!): FilesUploadResume!
  filesUploadComplete(uploadId: String!): File!
  filesUploadAbort(uploadId: String!): Boolean
  filesFolderAdd(name: String!, parentId: String, access: [FilesAccessGrantInput!], restricted: Boolean): FilesFolder
  filesFolderRename(_id: String!, name: String!): FilesFolder
  filesRename(_id: String!, name: String!): File
  filesMove(${itemIds}, folderId: String): Boolean
  filesRemove(${itemIds}): Boolean
  filesRestore(${itemIds}): Boolean
  filesPurge(${itemIds}): Boolean
`;
