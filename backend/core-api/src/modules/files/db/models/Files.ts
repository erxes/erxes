import { ICursorPaginateParams, ICursorPaginateResult } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp, ExpectedError } from 'erxes-api-shared/utils';
import { FilterQuery, Model } from 'mongoose';
import { nanoid } from 'nanoid';
import path from 'path';
import { IModels } from '~/connectionResolvers';
import {
  FILE_ACCESS_ROLES,
  FILE_PREVIEW_STATUSES,
  FILE_STATUSES,
  FILES_DERIVE_STALE_MS,
  FILES_MAX_PARTS,
  FILES_PART_SIZE,
  FILES_SIGN_BATCH,
  FILES_SINGLE_UPLOAD_MAX,
  FILES_TRASH_RETENTION_MS,
  FILES_UPLOAD_SESSION_TTL_MS,
} from '@/files/constants';
import { fileSchema, IFileDocument } from '@/files/db/definitions/files';
import { IFileFolderDocument } from '@/files/db/definitions/folders';
import { IFileUploadDocument } from '@/files/db/definitions/uploads';
import { IFileVersionDocument } from '@/files/db/definitions/versions';
import { validateItemName } from '@/files/db/models/FileFolders';
import {
  assertRole,
  FILE_GRANT_ROLES,
  fileAccessFields,
  fileAccessPipeline,
  logAdminReads,
  manageFilter,
  normalizeGrants,
  readFilter,
  TFilesAccessGrantInput,
  TFilesActor,
  withOwnerGrant,
} from '@/files/utils/access';
import { getFilesMaxFileSize, MB } from '@/files/utils/limits';
import { canServeInline, getExtension, SNIFF_BYTES, sniffMimeType } from '@/files/utils/mime';
import { buildPreview, getPreviewKind, withPreviewWorkspace } from '@/files/utils/previews';
import {
  abortMultipartUpload,
  completeMultipartUpload,
  deleteObjects,
  downloadObject,
  getFilesStorage,
  headObjectSize,
  listUploadedParts,
  readObjectHead,
  SIGNED_VIEWER_TTL_SECONDS,
  signRead,
  signSingleUpload,
  signUploadPart,
  startMultipartUpload,
  TFilesStorage,
  uploadObject,
} from '@/files/utils/storage';

export type TFilesSignedPart = { partNumber: number; url: string };

export type TFilesUploadSession = {
  uploadId: string;
  fileId: string;
  partSize: number;
  totalParts: number;
  singleUploadUrl?: string;
  parts: TFilesSignedPart[];
};

export type TFilesUploadResume = {
  uploadId: string;
  partSize: number;
  totalParts: number;
  uploadedPartNumbers: number[];
};

export type TFilesItemIds = { fileIds?: string[]; folderIds?: string[] };

export type TFilesListParams = ICursorPaginateParams & {
  folderId?: string;
  searchValue?: string;
};

const TRASH_LIMIT = 200;
const SHARED_WITH_ME_LIMIT = 500;

const uploadAccess = (folder: IFileFolderDocument, userId: string) => {
  const access = normalizeGrants(withOwnerGrant([], userId));

  return { access, ...fileAccessFields(folder, access) };
};
const BY_IDS_LIMIT = 100;

export type TFilesSweepResult = {
  expiredUploads: number;
  failedUploads: number;
  purgedFiles: number;
  purgedFolders: number;
  stalePreviews: number;
};

export type TFilesPreviewResult = {
  versionId: string;
  previewStatus: string;
  thumbnailKey?: string;
  viewerKey?: string;
};

type TFilePreviewFields = Pick<
  IFileVersionDocument,
  'previewStatus' | 'thumbnailKey' | 'viewerKey'
>;

export interface IFileModel extends Model<IFileDocument> {
  getFile(_id: string): Promise<IFileDocument>;
  getReadableFile(_id: string, actor: TFilesActor): Promise<IFileDocument>;
  listFiles(
    params: TFilesListParams,
    actor: TFilesActor,
  ): Promise<ICursorPaginateResult<IFileDocument>>;
  listByIds(_ids: string[], actor: TFilesActor): Promise<IFileDocument[]>;
  listTrash(
    actor: TFilesActor,
  ): Promise<{ files: IFileDocument[]; folders: IFileFolderDocument[] }>;
  listSharedFiles(actor: TFilesActor): Promise<IFileDocument[]>;
  setFileAccess(
    _id: string,
    access: TFilesAccessGrantInput[],
    actor: TFilesActor,
  ): Promise<IFileDocument>;
  addAccess(
    items: TFilesItemIds,
    grants: TFilesAccessGrantInput[],
    actor: TFilesActor,
  ): Promise<boolean>;
  startUpload(
    doc: {
      name: string;
      size: number;
      mimeType: string;
      folderId?: string;
      replaceFileId?: string;
    },
    actor: TFilesActor,
  ): Promise<TFilesUploadSession>;
  listVersions(fileId: string, actor: TFilesActor): Promise<IFileVersionDocument[]>;
  restoreVersion(fileId: string, versionId: string, actor: TFilesActor): Promise<IFileDocument>;
  signUploadParts(
    uploadId: string,
    from: number,
    to: number,
    userId: string,
  ): Promise<TFilesSignedPart[]>;
  resumeUpload(uploadId: string, userId: string): Promise<TFilesUploadResume>;
  completeUpload(uploadId: string, actor: TFilesActor): Promise<IFileDocument>;
  abortUpload(uploadId: string, userId?: string): Promise<boolean>;
  getDownloadUrl(
    _id: string,
    options: { versionId?: string; inline?: boolean; viewer?: boolean },
    actor: TFilesActor,
  ): Promise<string>;
  getSharedFileUrl(fileId: string, options?: { attachment?: boolean }): Promise<string>;
  derivePreview(versionId: string): Promise<TFilesPreviewResult>;
  renameFile(_id: string, name: string, actor: TFilesActor): Promise<IFileDocument>;
  moveItems(items: TFilesItemIds, folderId: string | undefined, actor: TFilesActor): Promise<boolean>;
  trashItems(items: TFilesItemIds, actor: TFilesActor): Promise<boolean>;
  restoreItems(items: TFilesItemIds, actor: TFilesActor): Promise<boolean>;
  purgeItems(items: TFilesItemIds, actor: TFilesActor): Promise<boolean>;
  sweep(): Promise<TFilesSweepResult>;
}

export const loadFileClass = (models: IModels) => {
  const storageKeyFor = (fileId: string, versionId: string) =>
    `files/${fileId}/${versionId}`;

  const previewUpdate = ({ previewStatus, thumbnailKey, viewerKey }: TFilePreviewFields) => {
    const $set: Record<string, string> = {
      previewStatus: previewStatus || FILE_PREVIEW_STATUSES.NONE,
    };
    const $unset: Record<string, 1> = {};

    for (const [key, value] of Object.entries({ thumbnailKey, viewerKey })) {
      if (value) {
        $set[key] = value;
      } else {
        $unset[key] = 1;
      }
    }

    // MongoDB rejects an empty $unset.
    return Object.keys($unset).length ? { $set, $unset } : { $set };
  };

  const setVersionPreview = async (
    version: { _id: string; fileId: string },
    fields: TFilePreviewFields,
  ) => {
    const update = previewUpdate(fields);
    const { matchedCount } = await models.FileVersions.updateOne(
      { _id: version._id },
      update,
    );

    await models.Files.updateOne(
      { _id: version.fileId, currentVersionId: version._id },
      update,
    );

    return matchedCount > 0;
  };

  const getSession = async (uploadId: string, userId?: string) => {
    const session = await models.FileUploads.findOne({
      _id: uploadId,
    }).lean<IFileUploadDocument | null>();

    if (!session || (userId && session.createdBy !== userId)) {
      throw new ExpectedError(
        'Upload session not found or expired. Start the upload again.',
        'FILES_UPLOAD_NOT_FOUND',
      );
    }

    return session;
  };

  const signParts = async (
    storage: TFilesStorage,
    session: IFileUploadDocument,
    from: number,
    to: number,
  ) => {
    if (!session.s3UploadId) {
      return [];
    }

    const first = Math.max(1, from);
    const last = Math.min(session.totalParts, to, first + FILES_SIGN_BATCH - 1);
    const parts: TFilesSignedPart[] = [];

    for (let partNumber = first; partNumber <= last; partNumber++) {
      parts.push({
        partNumber,
        url: await signUploadPart(
          storage,
          session.storageKey,
          session.s3UploadId,
          partNumber,
        ),
      });
    }

    return parts;
  };

  const assertPartsComplete = (
    session: IFileUploadDocument,
    parts: { partNumber: number; size: number }[],
  ) => {
    const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    const missing = session.totalParts - sorted.length;

    if (missing > 0) {
      throw new ExpectedError(
        `${missing} of ${session.totalParts} parts have not been uploaded yet`,
        'FILES_UPLOAD_INCOMPLETE',
      );
    }

    const total = sorted.reduce((sum, part) => sum + part.size, 0);

    if (total !== session.size) {
      throw new ExpectedError(
        `Uploaded ${total} bytes but the file is ${session.size} bytes`,
        'FILES_UPLOAD_SIZE_MISMATCH',
      );
    }
  };

  const purgeFiles = async (
    storage: TFilesStorage | null,
    files: { _id: string }[],
  ) => {
    if (!files.length) {
      return 0;
    }

    const fileIds = files.map((f) => f._id);
    const versions = await models.FileVersions.find(
      { fileId: { $in: fileIds } },
      { storageKey: 1, size: 1, thumbnailKey: 1, viewerKey: 1 },
    ).lean<
      { storageKey: string; size: number; thumbnailKey?: string; viewerKey?: string }[]
    >();

    if (versions.length) {
      await deleteObjects(
        storage || (await getFilesStorage(models)),
        versions.flatMap((v) =>
          [v.storageKey, v.thumbnailKey, v.viewerKey].filter(
            (key): key is string => !!key,
          ),
        ),
      );
    }

    await models.FileVersions.deleteMany({ fileId: { $in: fileIds } });
    await models.FilePins.deleteMany({ itemType: 'file', itemId: { $in: fileIds } });
    await models.FileShares.deleteMany({ fileId: { $in: fileIds } });
    await models.Files.deleteMany({ _id: { $in: fileIds } });
    await models.FileUsage.free(versions.reduce((sum, v) => sum + v.size, 0));

    return fileIds.length;
  };

  const purgeFolders = async (
    storage: TFilesStorage | null,
    folders: { _id: string }[],
  ) => {
    if (!folders.length) {
      return { files: 0, folders: 0 };
    }

    const rootIds = folders.map((f) => f._id);
    const descendants = await models.FileFolders.find(
      { ancestorIds: { $in: rootIds } },
      { _id: 1 },
    ).lean<{ _id: string }[]>();
    const folderIds = [...rootIds, ...descendants.map((d) => d._id)];
    const files = await models.Files.find(
      { folderId: { $in: folderIds } },
      { _id: 1 },
    ).lean<{ _id: string }[]>();

    const purgedFiles = await purgeFiles(storage, files);
    await models.FilePins.deleteMany({ itemType: 'folder', itemId: { $in: folderIds } });
    await models.FileFolders.deleteMany({ _id: { $in: folderIds } });

    return { files: purgedFiles, folders: folderIds.length };
  };

  const isFolderUsable = async (folderId?: string) => {
    if (!folderId) {
      return true;
    }

    const folder = await models.FileFolders.findOne(
      { _id: folderId },
      { deletedAt: 1, ancestorIds: 1 },
    ).lean<IFileFolderDocument | null>();

    if (!folder || folder.deletedAt) {
      return false;
    }

    const trashedAncestor = await models.FileFolders.exists({
      _id: { $in: folder.ancestorIds },
      deletedAt: { $exists: true, $ne: null },
    });

    return !trashedAncestor;
  };

  const signFileUrl = async (
    file: IFileDocument,
    {
      versionId,
      inline,
      viewer,
    }: { versionId?: string; inline?: boolean; viewer?: boolean },
  ) => {
    const version = await models.FileVersions.findOne({
      fileId: file._id,
      _id: versionId || file.currentVersionId,
    }).lean<{ storageKey: string; mimeType: string; viewerKey?: string } | null>();

    if (file.status !== FILE_STATUSES.READY || !version) {
      throw new ExpectedError('File is not ready yet', 'FILES_NOT_READY');
    }

    return signRead(
      await getFilesStorage(models),
      (viewer && version.viewerKey) || version.storageKey,
      {
        fileName: file.name,
        contentType: version.mimeType,
        inline: (!!inline || !!viewer) && canServeInline(version.mimeType),
        ...(viewer ? { expiresIn: SIGNED_VIEWER_TTL_SECONDS } : {}),
      },
    );
  };

  const loadManaged = async (
    { fileIds = [], folderIds = [] }: TFilesItemIds,
    actor: TFilesActor,
    operation: string,
    trashed: boolean,
  ) => {
    const state = trashed ? { deletedAt: { $ne: null } } : { deletedAt: null };
    const [files, folders]: [IFileDocument[], IFileFolderDocument[]] =
      await Promise.all([
        fileIds.length
          ? models.Files.find({ _id: { $in: fileIds }, ...state }).lean<IFileDocument[]>()
          : [],
        folderIds.length
          ? models.FileFolders.find({ _id: { $in: folderIds }, ...state }).lean<
              IFileFolderDocument[]
            >()
          : [],
      ]);

    files.forEach((file) => assertRole(actor, file, FILE_ACCESS_ROLES.MANAGER, operation, 'file'));
    folders.forEach((folder) => {
      if (folder.rootKey) {
        throw new ExpectedError('A space root cannot be changed', 'FILES_ROOT_LOCKED');
      }

      assertRole(actor, folder, FILE_ACCESS_ROLES.MANAGER, operation, 'folder');
    });

    return { files, folders };
  };

  const placeFiles = (fileIds: string[], folder: IFileFolderDocument, extra = {}) =>
    models.Files.updateMany({ _id: { $in: fileIds } }, [
      { $set: { folderId: folder._id } },
      ...(Object.keys(extra).length ? [extra] : []),
      ...fileAccessPipeline(folder),
    ]);

  const fallbackFolder = async (folderId: string | undefined, actor: TFilesActor) => {
    const folder = folderId
      ? await models.FileFolders.findOne({ _id: folderId }, { ancestorIds: 1, rootKey: 1 }).lean<
          IFileFolderDocument | null
        >()
      : null;
    const rootId = folder?.rootKey ? folder._id : folder?.ancestorIds[0];
    const root = rootId
      ? await models.FileFolders.findOne({ _id: rootId, rootKey: { $exists: true } })
      : null;

    return root || models.FileFolders.ensureUserRoot(actor.userId);
  };

  class FileModel {
    public static async getReadableFile(_id: string, actor: TFilesActor) {
      const file = await models.Files.getFile(_id);

      assertRole(actor, file, FILE_ACCESS_ROLES.VIEWER, 'viewFile', 'file');

      return file;
    }

    public static async listFiles(
      { folderId, searchValue, ...params }: TFilesListParams,
      actor: TFilesActor,
    ) {
      const search = searchValue?.trim();
      const folder =
        search
          ? null
          : folderId
            ? await models.FileFolders.getReadableFolder(folderId, actor)
            : await models.FileFolders.ensureUserRoot(actor.userId);

      const query: FilterQuery<IFileDocument> = {
        status: FILE_STATUSES.READY,
        deletedAt: null,
        ...readFilter(actor),
        ...(folder
          ? { folderId: folder._id }
          : { name: { $regex: escapeRegExp(search || ''), $options: 'i' } }),
      };

      const result = await cursorPaginate<IFileDocument>({
        model: models.Files,
        params: { orderBy: { name: 1 }, ...params },
        query,
      });

      logAdminReads(actor, search ? 'searchFiles' : 'listFiles', 'file', result.list);

      return result;
    }

    public static async listByIds(_ids: string[], actor: TFilesActor) {
      const files = await models.Files.find({
        _id: { $in: _ids.slice(0, BY_IDS_LIMIT) },
        ...readFilter(actor),
      }).lean<IFileDocument[]>();

      logAdminReads(actor, 'filesByIds', 'file', files);

      return files;
    }

    public static async listTrash(actor: TFilesActor) {
      const [files, folders] = await Promise.all([
        models.Files.find({ deletedAt: { $ne: null }, ...manageFilter(actor) })
          .sort({ deletedAt: -1 })
          .limit(TRASH_LIMIT)
          .lean<IFileDocument[]>(),
        models.FileFolders.find({ deletedAt: { $ne: null }, ...manageFilter(actor) })
          .sort({ deletedAt: -1 })
          .limit(TRASH_LIMIT)
          .lean<IFileFolderDocument[]>(),
      ]);

      return { files, folders };
    }

    public static async listSharedFiles(actor: TFilesActor) {
      const candidates = await models.Files.find({
        'access.key': { $in: actor.principals },
        createdBy: { $ne: actor.userId },
        status: FILE_STATUSES.READY,
        deletedAt: null,
      })
        .limit(SHARED_WITH_ME_LIMIT)
        .lean<IFileDocument[]>();

      const folderIds = [...new Set(candidates.map((f) => f.folderId).filter(Boolean))];
      const folders = await models.FileFolders.find(
        { _id: { $in: folderIds } },
        { readers: 1, deletedAt: 1, ancestorIds: 1 },
      ).lean<IFileFolderDocument[]>();
      const trashedAncestors = new Set(
        (
          await models.FileFolders.find(
            {
              _id: { $in: [...new Set(folders.flatMap((f) => f.ancestorIds))] },
              deletedAt: { $ne: null },
            },
            { _id: 1 },
          ).lean<{ _id: string }[]>()
        ).map((f) => f._id),
      );
      const byId = new Map(folders.map((f) => [f._id, f]));

      return candidates
        .filter((file) => {
          const folder = byId.get(file.folderId || '');

          if (!folder || folder.deletedAt || folder.ancestorIds.some((id) => trashedAncestors.has(id))) {
            return false;
          }

          return !folder.readers.some((key) => actor.principals.includes(key));
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    public static async addAccess(
      items: TFilesItemIds,
      grants: TFilesAccessGrantInput[],
      actor: TFilesActor,
    ) {
      const { files, folders } = await loadManaged(items, actor, 'setAccess', false);
      const fileGrants = grants.map((grant) =>
        grant.role === FILE_ACCESS_ROLES.CONTRIBUTOR
          ? { ...grant, role: FILE_ACCESS_ROLES.VIEWER }
          : grant,
      );

      for (const folder of folders) {
        await models.FileFolders.setAccess(
          folder._id,
          { access: [...(folder.access || []), ...grants], restricted: folder.restricted },
          actor,
        );
      }

      for (const file of files) {
        await models.Files.setFileAccess(file._id, [...(file.access || []), ...fileGrants], actor);
      }

      return true;
    }

    public static async setFileAccess(
      _id: string,
      access: TFilesAccessGrantInput[],
      actor: TFilesActor,
    ) {
      const file = await models.Files.getFile(_id);

      if (file.deletedAt) {
        throw new ExpectedError('File is in trash', 'FILES_IN_TRASH');
      }

      assertRole(actor, file, FILE_ACCESS_ROLES.MANAGER, 'setAccess', 'file');

      const folder = await models.FileFolders.getFolder(file.folderId || '');

      await models.Files.updateOne({ _id }, [
        { $set: { access: normalizeGrants(withOwnerGrant(access, file.createdBy), FILE_GRANT_ROLES) } },
        ...fileAccessPipeline(folder),
      ]);

      return models.Files.getFile(_id);
    }

    public static async getFile(_id: string) {
      const file = await models.Files.findOne({ _id });

      if (!file) {
        throw new ExpectedError('File not found', 'NOT_FOUND');
      }

      return file;
    }

    public static async startUpload(
      {
        name,
        size,
        mimeType,
        folderId,
        replaceFileId,
      }: {
        name: string;
        size: number;
        mimeType: string;
        folderId?: string;
        replaceFileId?: string;
      },
      actor: TFilesActor,
    ) {
      const userId = actor.userId;
      const fileName = validateItemName(name);

      if (!Number.isInteger(size) || size <= 0) {
        throw new ExpectedError('File is empty', 'FILES_INVALID_SIZE');
      }

      const maxSize = await getFilesMaxFileSize(models);

      if (size > maxSize) {
        throw new ExpectedError(
          `File is larger than the ${Math.round(maxSize / MB)} MB limit`,
          'FILES_TOO_LARGE',
        );
      }

      const totalParts = Math.ceil(size / FILES_PART_SIZE);

      if (totalParts > FILES_MAX_PARTS) {
        throw new ExpectedError('File is too large to upload', 'FILES_TOO_LARGE');
      }

      const replacing = replaceFileId ? await models.Files.getFile(replaceFileId) : null;

      if (replacing && (replacing.deletedAt || replacing.status !== FILE_STATUSES.READY)) {
        throw new ExpectedError('Only a ready file can be replaced', 'FILES_NOT_READY');
      }

      if (replacing) {
        assertRole(actor, replacing, FILE_ACCESS_ROLES.MANAGER, 'replaceFile', 'file');
      }

      const folder = replacing
        ? null
        : folderId
          ? await models.FileFolders.getActiveFolder(folderId)
          : await models.FileFolders.ensureUserRoot(userId);

      if (folder) {
        assertRole(actor, folder, FILE_ACCESS_ROLES.CONTRIBUTOR, 'upload', 'folder');
      }

      const storage = await getFilesStorage(models);
      const declaredType = mimeType || 'application/octet-stream';

      await models.FileUsage.reserve(size);

      let created: IFileDocument | null = null;
      let sessionId: string | undefined;

      try {
        const file =
          replacing ||
          (created = await models.Files.create({
          folderId: folder?._id,
          ...(folder ? uploadAccess(folder, userId) : {}),
          name: fileName,
          ext: getExtension(fileName),
          mimeType: declaredType,
          size,
          status: FILE_STATUSES.UPLOADING,
          createdBy: userId,
        }));

        const versionId = nanoid();
        const storageKey = storageKeyFor(file._id, versionId);
        const single = size <= FILES_SINGLE_UPLOAD_MAX;
        const s3UploadId = single
          ? undefined
          : await startMultipartUpload(storage, storageKey, declaredType);

        const session = await models.FileUploads.create({
          fileId: file._id,
          versionId,
          s3UploadId,
          storageKey,
          size,
          partSize: single ? size : FILES_PART_SIZE,
          totalParts: single ? 1 : totalParts,
          createdBy: userId,
          expiresAt: new Date(Date.now() + FILES_UPLOAD_SESSION_TTL_MS),
        });
        sessionId = session._id;

        return {
          uploadId: session._id,
          fileId: file._id,
          partSize: session.partSize,
          totalParts: session.totalParts,
          singleUploadUrl: single
            ? await signSingleUpload(storage, storageKey, declaredType)
            : undefined,
          parts: await signParts(storage, session, 1, FILES_SIGN_BATCH),
        };
      } catch (e) {
        await models.FileUsage.release(size);

        if (sessionId) {
          await models.FileUploads.deleteOne({ _id: sessionId });
        }

        if (created) {
          await models.Files.deleteOne({ _id: created._id });
        }

        throw e;
      }
    }

    public static async listVersions(fileId: string, actor: TFilesActor) {
      await models.Files.getReadableFile(fileId, actor);

      return models.FileVersions.find({ fileId })
        .sort({ version: -1 })
        .lean<IFileVersionDocument[]>();
    }

    public static async restoreVersion(fileId: string, versionId: string, actor: TFilesActor) {
      const file = await models.Files.getFile(fileId);

      assertRole(actor, file, FILE_ACCESS_ROLES.MANAGER, 'restoreVersion', 'file');
      const version = await models.FileVersions.findOne({ _id: versionId, fileId }).lean<IFileVersionDocument | null>();

      if (!version) {
        throw new ExpectedError('Version not found', 'NOT_FOUND');
      }

      if (file.deletedAt) {
        throw new ExpectedError('File is in trash', 'FILES_IN_TRASH');
      }

      const preview = previewUpdate(version);

      await models.Files.updateOne(
        { _id: fileId },
        {
          ...preview,
          $set: {
            currentVersionId: version._id,
            storageKey: version.storageKey,
            size: version.size,
            mimeType: version.mimeType,
            ...preview.$set,
          },
        },
      );

      return models.Files.getFile(fileId);
    }

    public static async signUploadParts(
      uploadId: string,
      from: number,
      to: number,
      userId: string,
    ) {
      const session = await getSession(uploadId, userId);

      return signParts(await getFilesStorage(models), session, from, to);
    }

    public static async resumeUpload(uploadId: string, userId: string) {
      const session = await getSession(uploadId, userId);
      const storage = await getFilesStorage(models);
      const uploaded = session.s3UploadId
        ? await listUploadedParts(storage, session.storageKey, session.s3UploadId)
        : [];

      return {
        uploadId: session._id,
        partSize: session.partSize,
        totalParts: session.totalParts,
        uploadedPartNumbers: uploaded.map((p) => p.partNumber).sort((a, b) => a - b),
      };
    }

    public static async completeUpload(uploadId: string, actor: TFilesActor) {
      const userId = actor.userId;
      const session = await getSession(uploadId, userId);
      const file = await models.Files.getFile(session.fileId);

      // Access may be revoked during a long upload, so it is checked again.
      if (file.status === FILE_STATUSES.READY) {
        assertRole(actor, file, FILE_ACCESS_ROLES.MANAGER, 'replaceFile', 'file');
      } else {
        const folder = file.folderId
          ? await models.FileFolders.findOne({ _id: file.folderId }).lean<IFileFolderDocument | null>()
          : null;

        if (!folder) {
          throw new ExpectedError('Folder not found', 'NOT_FOUND');
        }

        assertRole(actor, folder, FILE_ACCESS_ROLES.CONTRIBUTOR, 'upload', 'folder');
      }

      const storage = await getFilesStorage(models);

      if (session.s3UploadId) {
        const parts = await listUploadedParts(
          storage,
          session.storageKey,
          session.s3UploadId,
        );

        assertPartsComplete(session, parts);
        await completeMultipartUpload(
          storage,
          session.storageKey,
          session.s3UploadId,
          parts.sort((a, b) => a.partNumber - b.partNumber),
        );
      }

      let storedSize: number;

      try {
        storedSize = await headObjectSize(storage, session.storageKey);
      } catch {
        throw new ExpectedError(
          'The file has not reached storage yet',
          'FILES_UPLOAD_INCOMPLETE',
        );
      }

      if (storedSize !== session.size) {
        throw new ExpectedError(
          `Stored ${storedSize} bytes but the file is ${session.size} bytes`,
          'FILES_UPLOAD_SIZE_MISMATCH',
        );
      }

      const head = await readObjectHead(
        storage,
        session.storageKey,
        Math.min(SNIFF_BYTES, session.size),
      );
      const mimeType = sniffMimeType(head, file.name);
      const previewStatus = getPreviewKind(mimeType, session.size)
        ? FILE_PREVIEW_STATUSES.PENDING
        : FILE_PREVIEW_STATUSES.NONE;

      await models.FileVersions.create({
        _id: session.versionId,
        fileId: session.fileId,
        version:
          (await models.FileVersions.countDocuments({ fileId: session.fileId })) + 1,
        storageKey: session.storageKey,
        size: session.size,
        mimeType,
        createdBy: userId,
        previewStatus,
      });

      await models.Files.updateOne(
        { _id: session.fileId },
        {
          $set: {
            status: FILE_STATUSES.READY,
            mimeType,
            size: session.size,
            currentVersionId: session.versionId,
            storageKey: session.storageKey,
            previewStatus,
          },
          $unset: { thumbnailKey: 1, viewerKey: 1 },
        },
      );

      await models.FileUsage.commit(session.size);
      await models.FileUploads.deleteOne({ _id: session._id });

      return models.Files.getFile(session.fileId);
    }

    public static async abortUpload(uploadId: string, userId?: string) {
      const session = await getSession(uploadId, userId);
      const storage = await getFilesStorage(models);

      if (session.s3UploadId) {
        await abortMultipartUpload(storage, session.storageKey, session.s3UploadId);
      } else {
        await deleteObjects(storage, [session.storageKey]);
      }

      await models.FileUploads.deleteOne({ _id: session._id });
      await models.FileUsage.release(session.size);

      const hasVersions = await models.FileVersions.exists({ fileId: session.fileId });

      if (!hasVersions) {
        await models.Files.deleteOne({ _id: session.fileId });
      }

      return true;
    }

    public static async getSharedFileUrl(
      fileId: string,
      { attachment }: { attachment?: boolean } = {},
    ) {
      const file = await models.Files.getFile(fileId);

      return signFileUrl(file, { inline: !attachment && canServeInline(file.mimeType) });
    }

    public static async getDownloadUrl(
      _id: string,
      options: { versionId?: string; inline?: boolean; viewer?: boolean },
      actor: TFilesActor,
    ) {
      return signFileUrl(await models.Files.getReadableFile(_id, actor), options);
    }

    public static async derivePreview(versionId: string): Promise<TFilesPreviewResult> {
      const version = await models.FileVersions.findOne({
        _id: versionId,
      }).lean<IFileVersionDocument | null>();

      if (!version || version.previewStatus !== FILE_PREVIEW_STATUSES.PENDING) {
        return { versionId, previewStatus: version?.previewStatus || 'missing' };
      }

      const kind = getPreviewKind(version.mimeType, version.size);

      if (!kind) {
        await setVersionPreview(version, { previewStatus: FILE_PREVIEW_STATUSES.NONE });

        return { versionId, previewStatus: FILE_PREVIEW_STATUSES.NONE };
      }

      const storage = await getFilesStorage(models);

      try {
        const keys = await withPreviewWorkspace(async (dir) => {
          const sourcePath = path.join(dir, 'source');

          await downloadObject(storage, version.storageKey, sourcePath);

          const built = await buildPreview(kind, sourcePath, dir);
          const uploaded: TFilePreviewFields = {};

          if (built.thumbnailPath) {
            uploaded.thumbnailKey = `${version.storageKey}.thumb.png`;
            // Keyed by version, so the cached image never changes.
            await uploadObject(
              storage,
              uploaded.thumbnailKey,
              built.thumbnailPath,
              'image/png',
              'private, max-age=86400, immutable',
            );
          }

          if (built.viewerPath) {
            uploaded.viewerKey = `${version.storageKey}.viewer.pdf`;
            await uploadObject(storage, uploaded.viewerKey, built.viewerPath, 'application/pdf');
          }

          return uploaded;
        });

        const previewStatus = FILE_PREVIEW_STATUSES.READY;
        const stillExists = await setVersionPreview(version, { previewStatus, ...keys });

        // Purged while the job ran: nothing points at the new objects any more.
        if (!stillExists) {
          await deleteObjects(
            storage,
            [keys.thumbnailKey, keys.viewerKey].filter((key): key is string => !!key),
          );
        }

        return { versionId, previewStatus, ...keys };
      } catch (e) {
        await setVersionPreview(version, { previewStatus: FILE_PREVIEW_STATUSES.FAILED });

        throw e;
      }
    }

    public static async renameFile(_id: string, name: string, actor: TFilesActor) {
      const file = await models.Files.getFile(_id);

      if (file.deletedAt) {
        throw new ExpectedError('File is in trash', 'FILES_IN_TRASH');
      }

      assertRole(actor, file, FILE_ACCESS_ROLES.MANAGER, 'renameFile', 'file');

      const typed = validateItemName(name);
      // Rename keeps the extension: docx/xlsx are told apart by it.
      const fileName =
        file.ext && getExtension(typed) !== file.ext
          ? validateItemName(`${typed}.${file.ext}`)
          : typed;

      await models.Files.updateOne({ _id }, { $set: { name: fileName } });

      return models.Files.getFile(_id);
    }

    public static async moveItems(
      items: TFilesItemIds,
      folderId: string | undefined,
      actor: TFilesActor,
    ) {
      if (!folderId) {
        throw new ExpectedError('Choose a folder to move into', 'FILES_INVALID_MOVE');
      }

      const target = await models.FileFolders.getActiveFolder(folderId);

      assertRole(actor, target, FILE_ACCESS_ROLES.CONTRIBUTOR, 'move', 'folder');

      const { files, folders } = await loadManaged(items, actor, 'move', false);

      for (const folder of folders) {
        await models.FileFolders.moveFolder(folder._id, target._id);
      }

      if (files.length) {
        await placeFiles(
          files.map((f) => f._id),
          target,
        );
      }

      return true;
    }

    public static async trashItems(items: TFilesItemIds, actor: TFilesActor) {
      const { files, folders } = await loadManaged(items, actor, 'trash', false);
      const trashed = { deletedAt: new Date(), deletedBy: actor.userId };

      if (files.length) {
        await models.Files.updateMany(
          { _id: { $in: files.map((f) => f._id) }, deletedAt: null },
          { $set: trashed },
        );
      }

      if (folders.length) {
        await models.FileFolders.updateMany(
          { _id: { $in: folders.map((f) => f._id) }, deletedAt: null },
          { $set: trashed },
        );
      }

      return true;
    }

    public static async restoreItems(items: TFilesItemIds, actor: TFilesActor) {
      const { files, folders } = await loadManaged(items, actor, 'restore', true);
      const restored = { $unset: { deletedAt: 1, deletedBy: 1 } };

      for (const folder of folders) {
        await models.FileFolders.updateOne({ _id: folder._id }, restored);

        if (!(await isFolderUsable(folder.parentId))) {
          const root = await fallbackFolder(folder.parentId, actor);

          await models.FileFolders.moveFolder(folder._id, root._id);
        }
      }

      for (const file of files) {
        if (await isFolderUsable(file.folderId)) {
          await models.Files.updateOne({ _id: file._id }, restored);
          continue;
        }

        const root = await fallbackFolder(file.folderId, actor);

        await placeFiles([file._id], root, { $unset: ['deletedAt', 'deletedBy'] });
      }

      return true;
    }

    public static async purgeItems(items: TFilesItemIds, actor: TFilesActor) {
      const { files, folders } = await loadManaged(items, actor, 'purge', true);

      if (!files.length && !folders.length) {
        return true;
      }

      const storage = await getFilesStorage(models);

      await purgeFiles(storage, files);
      await purgeFolders(storage, folders);

      return true;
    }

    public static async sweep() {
      const result: TFilesSweepResult = {
        expiredUploads: 0,
        failedUploads: 0,
        purgedFiles: 0,
        purgedFolders: 0,
        stalePreviews: 0,
      };

      const expired = await models.FileUploads.find(
        { expiresAt: { $lt: new Date() } },
        { _id: 1 },
      ).lean<{ _id: string }[]>();

      // One broken session must not block the rest of the sweep.
      for (const session of expired) {
        try {
          await models.Files.abortUpload(session._id);
          result.expiredUploads++;
        } catch {
          result.failedUploads++;
        }
      }

      const cutoff = new Date(Date.now() - FILES_TRASH_RETENTION_MS);
      const oldFolders = await models.FileFolders.find(
        { deletedAt: { $lt: cutoff } },
        { _id: 1 },
      ).lean<{ _id: string }[]>();

      if (oldFolders.length) {
        const folders = await purgeFolders(null, oldFolders);

        result.purgedFiles += folders.files;
        result.purgedFolders += folders.folders;
      }

      // Read after the folders go, so their files aren't counted twice.
      const oldFiles = await models.Files.find(
        { deletedAt: { $lt: cutoff } },
        { _id: 1 },
      ).lean<{ _id: string }[]>();

      result.purgedFiles += await purgeFiles(null, oldFiles);

      const stale = await models.FileVersions.find(
        {
          previewStatus: FILE_PREVIEW_STATUSES.PENDING,
          createdAt: { $lt: new Date(Date.now() - FILES_DERIVE_STALE_MS) },
        },
        { _id: 1, fileId: 1 },
      ).lean<{ _id: string; fileId: string }[]>();

      for (const version of stale) {
        await setVersionPreview(version, { previewStatus: FILE_PREVIEW_STATUSES.FAILED });
      }

      result.stalePreviews = stale.length;

      const [used] = await models.FileVersions.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$size' } } },
      ]);
      const [reserved] = await models.FileUploads.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$size' } } },
      ]);

      await models.FileUsage.reconcile(used?.total || 0, reserved?.total || 0);

      return result;
    }
  }

  fileSchema.loadClass(FileModel);

  return fileSchema;
};
