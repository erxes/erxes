import { ExpectedError } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IFileDocument } from '@/files/db/definitions/files';
import { IFileFolderDocument } from '@/files/db/definitions/folders';
import {
  filePinSchema,
  IFilePinDocument,
  TFilePinItemType,
} from '@/files/db/definitions/pins';
import { FILE_ACCESS_ROLES, FILES_MAX_PINS } from '@/files/constants';
import { TFilesItemIds } from '@/files/db/models/Files';
import { assertRole, logAdminReads, readFilter, TFilesActor } from '@/files/utils/access';

export type TFilesPinned = { files: IFileDocument[]; folders: IFileFolderDocument[] };

export interface IFilePinModel extends Model<IFilePinDocument> {
  pin(actor: TFilesActor, itemType: TFilePinItemType, itemId: string): Promise<boolean>;
  pinMany(actor: TFilesActor, items: TFilesItemIds): Promise<boolean>;
  unpin(userId: string, itemType: TFilePinItemType, itemId: string): Promise<boolean>;
  getPinned(actor: TFilesActor): Promise<TFilesPinned>;
}

export const loadFilePinClass = (models: IModels) => {
  class FilePinModel {
    public static async pin(actor: TFilesActor, itemType: TFilePinItemType, itemId: string) {
      return models.FilePins.pinMany(actor, {
        [itemType === 'file' ? 'fileIds' : 'folderIds']: [itemId],
      });
    }

    public static async pinMany(
      actor: TFilesActor,
      { fileIds = [], folderIds = [] }: TFilesItemIds,
    ) {
      const userId = actor.userId;
      const [files, folders] = await Promise.all([
        models.Files.find({ _id: { $in: fileIds }, deletedAt: null }).lean<IFileDocument[]>(),
        models.FileFolders.find({ _id: { $in: folderIds }, deletedAt: null }).lean<
          IFileFolderDocument[]
        >(),
      ]);

      if (files.length !== new Set(fileIds).size || folders.length !== new Set(folderIds).size) {
        throw new ExpectedError('Item not found', 'NOT_FOUND');
      }

      files.forEach((file) => assertRole(actor, file, FILE_ACCESS_ROLES.VIEWER, 'pin', 'file'));
      folders.forEach((folder) =>
        assertRole(actor, folder, FILE_ACCESS_ROLES.VIEWER, 'pin', 'folder'),
      );

      const wanted = [
        ...files.map((f) => ({ itemType: 'file' as const, itemId: f._id })),
        ...folders.map((f) => ({ itemType: 'folder' as const, itemId: f._id })),
      ];
      const existing = await models.FilePins.find({ userId }, { itemType: 1, itemId: 1 }).lean<
        IFilePinDocument[]
      >();
      const pinned = new Set(existing.map((p) => `${p.itemType}:${p.itemId}`));
      const added = wanted.filter((w) => !pinned.has(`${w.itemType}:${w.itemId}`));

      if (existing.length + added.length > FILES_MAX_PINS) {
        throw new ExpectedError(
          `You can pin up to ${FILES_MAX_PINS} items`,
          'FILES_TOO_MANY_PINS',
        );
      }

      if (added.length) {
        await models.FilePins.insertMany(added.map((item) => ({ userId, ...item })));
      }

      return true;
    }

    public static async unpin(userId: string, itemType: TFilePinItemType, itemId: string) {
      await models.FilePins.deleteOne({ userId, itemType, itemId });

      return true;
    }

    public static async getPinned(actor: TFilesActor) {
      const pins = await models.FilePins.find({ userId: actor.userId })
        .sort({ createdAt: 1 })
        .lean<IFilePinDocument[]>();
      const idsOf = (type: TFilePinItemType) =>
        pins.filter((p) => p.itemType === type).map((p) => p.itemId);

      const [files, folders] = await Promise.all([
        models.Files.find({
          _id: { $in: idsOf('file') },
          deletedAt: null,
          ...readFilter(actor),
        }).lean<IFileDocument[]>(),
        models.FileFolders.find({
          _id: { $in: idsOf('folder') },
          deletedAt: null,
          ...readFilter(actor),
        }).lean<IFileFolderDocument[]>(),
      ]);

      logAdminReads(actor, 'pins', 'file', files);
      logAdminReads(actor, 'pins', 'folder', folders);

      return { files, folders };
    }
  }

  filePinSchema.loadClass(FilePinModel);

  return filePinSchema;
};
