import { randomBytes } from 'crypto';
import { ExpectedError } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { FILE_ACCESS_ROLES, FILE_STATUSES } from '@/files/constants';
import { assertRole, roleOf, TFilesActor } from '@/files/utils/access';
import { fileShareSchema, IFileShareDocument } from '@/files/db/definitions/shares';

export interface IFileShareModel extends Model<IFileShareDocument> {
  getActiveShare(fileId: string): Promise<IFileShareDocument | null>;
  withActiveLink(fileIds: string[]): Promise<Set<string>>;
  getManagedShare(fileId: string, actor: TFilesActor): Promise<IFileShareDocument | null>;
  createShare(fileId: string, actor: TFilesActor): Promise<IFileShareDocument>;
  revokeShare(fileId: string, actor: TFilesActor): Promise<boolean>;
  resolveToken(token: string): Promise<IFileShareDocument>;
}

export const loadFileShareClass = (models: IModels) => {
  class FileShareModel {
    public static async getActiveShare(fileId: string) {
      return models.FileShares.findOne({ fileId, revokedAt: null }).lean<IFileShareDocument | null>();
    }

    public static async withActiveLink(fileIds: string[]) {
      const shares = await models.FileShares.find(
        { fileId: { $in: fileIds }, revokedAt: null },
        { fileId: 1 },
      ).lean<{ fileId: string }[]>();

      return new Set(shares.map((share) => share.fileId));
    }

    public static async getManagedShare(fileId: string, actor: TFilesActor) {
      const file = await models.Files.getFile(fileId);

      // The link is a credential; admin read rights don't reveal it.
      if (roleOf(file, actor.principals) !== FILE_ACCESS_ROLES.MANAGER) {
        return null;
      }

      return models.FileShares.getActiveShare(fileId);
    }

    public static async createShare(fileId: string, actor: TFilesActor) {
      const file = await models.Files.getFile(fileId);

      assertRole(actor, file, FILE_ACCESS_ROLES.MANAGER, 'shareCreate', 'file');

      if (file.status !== FILE_STATUSES.READY || file.deletedAt) {
        throw new ExpectedError('Only a ready file can be shared', 'FILES_NOT_READY');
      }

      const existing = await models.FileShares.getActiveShare(fileId);

      if (existing) {
        return existing;
      }

      return models.FileShares.create({
        fileId,
        token: randomBytes(24).toString('base64url'),
        createdBy: actor.userId,
      });
    }

    public static async revokeShare(fileId: string, actor: TFilesActor) {
      assertRole(actor, await models.Files.getFile(fileId), FILE_ACCESS_ROLES.MANAGER, 'shareRevoke', 'file');

      await models.FileShares.updateMany(
        { fileId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );

      return true;
    }

    public static async resolveToken(token: string) {
      const share = await models.FileShares.findOne({ token, revokedAt: null });
      const file = share ? await models.Files.findOne({ _id: share.fileId }) : null;

      if (!share || !file || file.deletedAt || file.status !== FILE_STATUSES.READY) {
        throw new ExpectedError('This link is no longer available', 'NOT_FOUND');
      }

      return share;
    }
  }

  fileShareSchema.loadClass(FileShareModel);

  return fileShareSchema;
};
