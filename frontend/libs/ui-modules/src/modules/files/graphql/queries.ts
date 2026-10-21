import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';
import gql from 'graphql-tag';

const FILES_ACCESS_GRANT_FIELDS = `
  type
  id
  role
`;

export const FILE_FIELDS = `
  _id
  folderId
  name
  ext
  mimeType
  size
  status
  currentVersionId
  previewStatus
  thumbnailUrl
  myRole
  sharedWith {
    ${FILES_ACCESS_GRANT_FIELDS}
  }
  publicLink
  createdBy
  createdAt
  updatedAt
  deletedAt
`;

export const FILES_FOLDER_FIELDS = `
  _id
  name
  parentId
  ancestorIds
  appearance {
    color
    icon
    coverFileId
  }
  coverUrl
  myRole
  space
  sharedWith {
    ${FILES_ACCESS_GRANT_FIELDS}
  }
  createdBy
  createdAt
  deletedAt
`;

export const FILES_FILE_ACCESS = gql(`
  query FilesFileAccess($_id: String!) {
    filesDetail(_id: $_id) {
      _id
      name
      folderId
      myRole
      createdBy
      access {
        ${FILES_ACCESS_GRANT_FIELDS}
      }
      inheritedAccess {
        ${FILES_ACCESS_GRANT_FIELDS}
      }
    }
  }
`);

export const FILES_SPACES = gql(`
  query FilesSpaces {
    filesSpaces {
      myRootId
      orgRootId
    }
  }
`);

export const FILES_SHARED_WITH_ME = gql(`
  query FilesSharedWithMe {
    filesSharedWithMe {
      folders {
        ${FILES_FOLDER_FIELDS}
      }
      files {
        ${FILE_FIELDS}
      }
    }
  }
`);

export const FILES_FOLDER_ACCESS = gql(`
  query FilesFolderAccess($_id: String!) {
    filesFolderDetail(_id: $_id) {
      _id
      name
      parentId
      myRole
      space
      createdBy
      restricted
      access {
        ${FILES_ACCESS_GRANT_FIELDS}
      }
      inheritedAccess {
        ${FILES_ACCESS_GRANT_FIELDS}
      }
    }
  }
`);

export const FILES_LIST = gql(`
  query FilesList($folderId: String, $searchValue: String, ${GQL_CURSOR_PARAM_DEFS}) {
    filesList(folderId: $folderId, searchValue: $searchValue, ${GQL_CURSOR_PARAMS}) {
      list {
        ${FILE_FIELDS}
      }
      ${GQL_PAGE_INFO}
    }
  }
`);

export const FILES_FOLDERS = gql(`
  query FilesFolders($parentId: String) {
    filesFolders(parentId: $parentId) {
      ${FILES_FOLDER_FIELDS}
    }
  }
`);

export const FILES_FOLDER_PATH = gql(`
  query FilesFolderPath($_id: String!) {
    filesFolderPath(_id: $_id) {
      ${FILES_FOLDER_FIELDS}
    }
  }
`);

export const FILES_TRASH = gql(`
  query FilesTrash {
    filesTrash {
      files {
        ${FILE_FIELDS}
      }
      folders {
        ${FILES_FOLDER_FIELDS}
      }
    }
  }
`);

export const FILES_USAGE = gql(`
  query FilesUsage {
    filesUsage {
      usedBytes
      reservedBytes
      quotaBytes
      maxFileSize
    }
  }
`);

export const FILES_DOWNLOAD_URL = gql(`
  query FilesDownloadUrl($_id: String!, $versionId: String, $inline: Boolean, $viewer: Boolean) {
    filesDownloadUrl(_id: $_id, versionId: $versionId, inline: $inline, viewer: $viewer)
  }
`);

export const FILES_BY_IDS = gql(`
  query FilesByIds($_ids: [String!]!) {
    filesByIds(_ids: $_ids) {
      ${FILE_FIELDS}
    }
  }
`);

export const FILES_VERSIONS = gql(`
  query FilesVersions($fileId: String!) {
    filesVersions(fileId: $fileId) {
      _id
      fileId
      version
      size
      mimeType
      createdBy
      createdAt
    }
  }
`);

export const FILES_PINS = gql(`
  query FilesPins {
    filesPins {
      files {
        ${FILE_FIELDS}
      }
      folders {
        ${FILES_FOLDER_FIELDS}
      }
    }
  }
`);

export const FILES_SHARE = gql(`
  query FilesShare($fileId: String!) {
    filesShare(fileId: $fileId) {
      _id
      fileId
      token
      createdAt
    }
  }
`);
