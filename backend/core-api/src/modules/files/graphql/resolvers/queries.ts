import { IContext } from '~/connectionResolvers';
import { TFilesListParams } from '@/files/db/models/Files';
import { getFilesActor } from '@/files/utils/access';
import { getFilesMaxFileSize } from '@/files/utils/limits';

export const filesQueries = {
  async filesSpaces(_parent: undefined, _args: undefined, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.getSpaces(await getFilesActor(context));
  },

  async filesList(_parent: undefined, params: TFilesListParams, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.Files.listFiles(params, await getFilesActor(context));
  },

  async filesDetail(_parent: undefined, { _id }: { _id: string }, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.Files.getReadableFile(_id, await getFilesActor(context));
  },

  async filesByIds(_parent: undefined, { _ids }: { _ids: string[] }, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.Files.listByIds(_ids, await getFilesActor(context));
  },

  async filesFolders(
    _parent: undefined,
    { parentId }: { parentId?: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.listFolders(parentId, await getFilesActor(context));
  },

  async filesFolderDetail(_parent: undefined, { _id }: { _id: string }, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.getReadableFolder(_id, await getFilesActor(context));
  },

  async filesSharedWithMe(_parent: undefined, _args: undefined, context: IContext) {
    await context.checkPermission('filesRead');

    const actor = await getFilesActor(context);
    const [folders, files] = await Promise.all([
      context.models.FileFolders.listSharedWithMe(actor),
      context.models.Files.listSharedFiles(actor),
    ]);

    return { folders, files };
  },

  async filesFolderPath(_parent: undefined, { _id }: { _id: string }, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.FileFolders.getPath(_id, await getFilesActor(context));
  },

  async filesTrash(_parent: undefined, _args: undefined, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.Files.listTrash(await getFilesActor(context));
  },

  async filesUsage(_parent: undefined, _args: undefined, { models, checkPermission }: IContext) {
    await checkPermission('filesRead');

    return {
      ...(await models.FileUsage.getUsage()),
      maxFileSize: await getFilesMaxFileSize(models),
    };
  },

  async filesVersions(
    _parent: undefined,
    { fileId }: { fileId: string },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.listVersions(fileId, await getFilesActor(context));
  },

  async filesPins(_parent: undefined, _args: undefined, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.FilePins.getPinned(await getFilesActor(context));
  },

  async filesShare(_parent: undefined, { fileId }: { fileId: string }, context: IContext) {
    await context.checkPermission('filesRead');

    return context.models.FileShares.getManagedShare(fileId, await getFilesActor(context));
  },

  async filesDownloadUrl(
    _parent: undefined,
    {
      _id,
      ...options
    }: { _id: string; versionId?: string; inline?: boolean; viewer?: boolean },
    context: IContext,
  ) {
    await context.checkPermission('filesRead');

    return context.models.Files.getDownloadUrl(_id, options, await getFilesActor(context));
  },
};
