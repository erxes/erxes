import { IContext } from '~/connectionResolvers';
import { ExpectedError } from 'erxes-api-shared/utils';
import { FILE_PIN_ITEM_TYPES, TFilePinItemType } from '@/files/db/definitions/pins';
import { FILE_PREVIEW_STATUSES } from '@/files/constants';
import { TFilesAccessInput } from '@/files/db/models/FileFolders';
import { TFilesItemIds } from '@/files/db/models/Files';
import { getFilesActor, TFilesAccessGrantInput } from '@/files/utils/access';
import { queueFilesPreview, scheduleFilesSweep } from '@/files/worker';

const assertPinType = (itemType: string): TFilePinItemType => {
  if (!FILE_PIN_ITEM_TYPES.includes(itemType as TFilePinItemType)) {
    throw new ExpectedError('itemType must be file or folder', 'FILES_INVALID_PIN');
  }

  return itemType as TFilePinItemType;
};

export const filesMutations = {
  async filesUploadStart(
    _parent: undefined,
    doc: {
      name: string;
      size: number;
      mimeType?: string;
      folderId?: string;
      replaceFileId?: string;
    },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    const session = await context.models.Files.startUpload(
      { ...doc, mimeType: doc.mimeType || '' },
      await getFilesActor(context),
    );

    await scheduleFilesSweep(context.subdomain);

    return session;
  },

  async filesUploadSignParts(
    _parent: undefined,
    { uploadId, from, to }: { uploadId: string; from: number; to: number },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('filesRead');

    return models.Files.signUploadParts(uploadId, from, to, user._id);
  },

  async filesUploadResume(
    _parent: undefined,
    { uploadId }: { uploadId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('filesRead');

    return models.Files.resumeUpload(uploadId, user._id);
  },

  async filesUploadComplete(
    _parent: undefined,
    { uploadId }: { uploadId: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    const file = await context.models.Files.completeUpload(
      uploadId,
      await getFilesActor(context),
    );

    if (file.previewStatus === FILE_PREVIEW_STATUSES.PENDING && file.currentVersionId) {
      // The upload succeeded; the sweep fails previews the queue never got.
      await queueFilesPreview(context.subdomain, file.currentVersionId).catch(() => undefined);
    }

    return file;
  },

  async filesUploadAbort(
    _parent: undefined,
    { uploadId }: { uploadId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('filesRead');

    return models.Files.abortUpload(uploadId, user._id);
  },

  async filesVersionRestore(
    _parent: undefined,
    { fileId, versionId }: { fileId: string; versionId: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.restoreVersion(fileId, versionId, await getFilesActor(context));
  },

  async filesPin(
    _parent: undefined,
    { itemType, itemId }: { itemType: TFilePinItemType; itemId: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FilePins.pin(
      await getFilesActor(context),
      assertPinType(itemType),
      itemId,
    );
  },

  async filesUnpin(
    _parent: undefined,
    { itemType, itemId }: { itemType: TFilePinItemType; itemId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('filesRead');

    return models.FilePins.unpin(user._id, assertPinType(itemType), itemId);
  },

  async filesFolderAppearance(
    _parent: undefined,
    { _id, ...appearance }: { _id: string; color?: string; icon?: string; coverFileId?: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.setAppearance(
      _id,
      appearance,
      await getFilesActor(context),
    );
  },

  async filesFolderAccessUpdate(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & TFilesAccessInput,
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.setAccess(_id, doc, await getFilesActor(context));
  },

  async filesPinMany(_parent: undefined, items: TFilesItemIds, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.FilePins.pinMany(await getFilesActor(context), items);
  },

  async filesFolderAppearanceMany(
    _parent: undefined,
    { _ids, ...appearance }: { _ids: string[]; color?: string; icon?: string; coverFileId?: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.setAppearanceMany(
      _ids,
      appearance,
      await getFilesActor(context),
    );
  },

  async filesAccessAdd(
    _parent: undefined,
    { access, ...items }: TFilesItemIds & { access: TFilesAccessGrantInput[] },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.addAccess(items, access, await getFilesActor(context));
  },

  async filesFileAccessUpdate(
    _parent: undefined,
    { _id, access }: { _id: string; access: TFilesAccessGrantInput[] },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.setFileAccess(_id, access, await getFilesActor(context));
  },

  async filesShareCreate(
    _parent: undefined,
    { fileId }: { fileId: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileShares.createShare(fileId, await getFilesActor(context));
  },

  async filesShareRevoke(
    _parent: undefined,
    { fileId }: { fileId: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileShares.revokeShare(fileId, await getFilesActor(context));
  },

  async filesFolderAdd(
    _parent: undefined,
    doc: { name: string; parentId?: string } & TFilesAccessInput,
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.createFolder(doc, await getFilesActor(context));
  },

  async filesFolderRename(
    _parent: undefined,
    { _id, name }: { _id: string; name: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.renameFolder(_id, name, await getFilesActor(context));
  },

  async filesRename(
    _parent: undefined,
    { _id, name }: { _id: string; name: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.renameFile(_id, name, await getFilesActor(context));
  },

  async filesMove(
    _parent: undefined,
    { folderId, ...items }: TFilesItemIds & { folderId?: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.moveItems(items, folderId, await getFilesActor(context));
  },

  async filesRemove(_parent: undefined, items: TFilesItemIds, context: IContext) {
    await context.checkPermission('filesRead');

    const result = await context.models.Files.trashItems(items, await getFilesActor(context));

    await scheduleFilesSweep(context.subdomain);

    return result;
  },

  async filesRestore(_parent: undefined, items: TFilesItemIds, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.Files.restoreItems(items, await getFilesActor(context));
  },

  async filesPurge(_parent: undefined, items: TFilesItemIds, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.Files.purgeItems(items, await getFilesActor(context));
  },
};
