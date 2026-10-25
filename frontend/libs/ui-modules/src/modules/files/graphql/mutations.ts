import gql from 'graphql-tag';
import { FILE_FIELDS, FILES_FOLDER_FIELDS } from './queries';

const SIGNED_PART = `
  partNumber
  url
`;

export const FILES_UPLOAD_START = gql(`
  mutation FilesUploadStart($name: String!, $size: Float!, $mimeType: String, $folderId: String, $replaceFileId: String) {
    filesUploadStart(name: $name, size: $size, mimeType: $mimeType, folderId: $folderId, replaceFileId: $replaceFileId) {
      uploadId
      fileId
      partSize
      totalParts
      singleUploadUrl
      parts {
        ${SIGNED_PART}
      }
    }
  }
`);

export const FILES_UPLOAD_SIGN_PARTS = gql(`
  mutation FilesUploadSignParts($uploadId: String!, $from: Int!, $to: Int!) {
    filesUploadSignParts(uploadId: $uploadId, from: $from, to: $to) {
      ${SIGNED_PART}
    }
  }
`);

export const FILES_UPLOAD_RESUME = gql(`
  mutation FilesUploadResume($uploadId: String!) {
    filesUploadResume(uploadId: $uploadId) {
      uploadId
      partSize
      totalParts
      uploadedPartNumbers
    }
  }
`);

export const FILES_UPLOAD_COMPLETE = gql(`
  mutation FilesUploadComplete($uploadId: String!) {
    filesUploadComplete(uploadId: $uploadId) {
      ${FILE_FIELDS}
    }
  }
`);

export const FILES_UPLOAD_ABORT = gql(`
  mutation FilesUploadAbort($uploadId: String!) {
    filesUploadAbort(uploadId: $uploadId)
  }
`);

export const FILES_FOLDER_ADD = gql(`
  mutation FilesFolderAdd($name: String!, $parentId: String, $access: [FilesAccessGrantInput!], $restricted: Boolean) {
    filesFolderAdd(name: $name, parentId: $parentId, access: $access, restricted: $restricted) {
      ${FILES_FOLDER_FIELDS}
    }
  }
`);

export const FILES_FILE_ACCESS_UPDATE = gql(`
  mutation FilesFileAccessUpdate($_id: String!, $access: [FilesAccessGrantInput!]!) {
    filesFileAccessUpdate(_id: $_id, access: $access) {
      ${FILE_FIELDS}
    }
  }
`);

export const FILES_FOLDER_ACCESS_UPDATE = gql(`
  mutation FilesFolderAccessUpdate($_id: String!, $access: [FilesAccessGrantInput!]!, $restricted: Boolean) {
    filesFolderAccessUpdate(_id: $_id, access: $access, restricted: $restricted) {
      ${FILES_FOLDER_FIELDS}
    }
  }
`);

export const FILES_FOLDER_RENAME = gql(`
  mutation FilesFolderRename($_id: String!, $name: String!) {
    filesFolderRename(_id: $_id, name: $name) {
      ${FILES_FOLDER_FIELDS}
    }
  }
`);

export const FILES_RENAME = gql(`
  mutation FilesRename($_id: String!, $name: String!) {
    filesRename(_id: $_id, name: $name) {
      ${FILE_FIELDS}
    }
  }
`);

const ITEM_IDS_DEFS = `$fileIds: [String], $folderIds: [String]`;
const ITEM_IDS = `fileIds: $fileIds, folderIds: $folderIds`;

export const FILES_MOVE = gql(`
  mutation FilesMove(${ITEM_IDS_DEFS}, $folderId: String) {
    filesMove(${ITEM_IDS}, folderId: $folderId)
  }
`);

export const FILES_REMOVE = gql(`
  mutation FilesRemove(${ITEM_IDS_DEFS}) {
    filesRemove(${ITEM_IDS})
  }
`);

export const FILES_RESTORE = gql(`
  mutation FilesRestore(${ITEM_IDS_DEFS}) {
    filesRestore(${ITEM_IDS})
  }
`);

export const FILES_PURGE = gql(`
  mutation FilesPurge(${ITEM_IDS_DEFS}) {
    filesPurge(${ITEM_IDS})
  }
`);

export const FILES_VERSION_RESTORE = gql(`
  mutation FilesVersionRestore($fileId: String!, $versionId: String!) {
    filesVersionRestore(fileId: $fileId, versionId: $versionId) {
      ${FILE_FIELDS}
    }
  }
`);

export const FILES_PIN = gql(`
  mutation FilesPin($itemType: String!, $itemId: String!) {
    filesPin(itemType: $itemType, itemId: $itemId)
  }
`);

export const FILES_UNPIN = gql(`
  mutation FilesUnpin($itemType: String!, $itemId: String!) {
    filesUnpin(itemType: $itemType, itemId: $itemId)
  }
`);

export const FILES_FOLDER_APPEARANCE = gql(`
  mutation FilesFolderAppearance($_id: String!, $color: String, $icon: String, $coverFileId: String) {
    filesFolderAppearance(_id: $_id, color: $color, icon: $icon, coverFileId: $coverFileId) {
      ${FILES_FOLDER_FIELDS}
    }
  }
`);

export const FILES_SHARE_CREATE = gql(`
  mutation FilesShareCreate($fileId: String!) {
    filesShareCreate(fileId: $fileId) {
      _id
      fileId
      token
      createdAt
    }
  }
`);

export const FILES_SHARE_REVOKE = gql(`
  mutation FilesShareRevoke($fileId: String!) {
    filesShareRevoke(fileId: $fileId)
  }
`);

export const FILES_PIN_MANY = gql(`
  mutation FilesPinMany(${ITEM_IDS_DEFS}) {
    filesPinMany(${ITEM_IDS})
  }
`);

export const FILES_FOLDER_APPEARANCE_MANY = gql(`
  mutation FilesFolderAppearanceMany($_ids: [String!]!, $color: String, $icon: String, $coverFileId: String) {
    filesFolderAppearanceMany(_ids: $_ids, color: $color, icon: $icon, coverFileId: $coverFileId)
  }
`);

export const FILES_ACCESS_ADD = gql(`
  mutation FilesAccessAdd(${ITEM_IDS_DEFS}, $access: [FilesAccessGrantInput!]!) {
    filesAccessAdd(${ITEM_IDS}, access: $access)
  }
`);
