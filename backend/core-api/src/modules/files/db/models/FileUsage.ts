import { ExpectedError } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getConfig } from '~/modules/organization/settings/utils/configs';
import { FILES_USAGE_ID } from '@/files/constants';
import {
  fileUsageSchema,
  IFileUsageDocument,
} from '@/files/db/definitions/usage';

const GB = 1024 * 1024 * 1024;

export type TFilesUsage = {
  usedBytes: number;
  reservedBytes: number;
  quotaBytes: number | null;
};

export interface IFileUsageModel extends Model<IFileUsageDocument> {
  getUsage(): Promise<TFilesUsage>;
  reserve(size: number): Promise<void>;
  release(size: number): Promise<void>;
  commit(size: number): Promise<void>;
  free(size: number): Promise<void>;
  reconcile(usedBytes: number, reservedBytes: number): Promise<void>;
}

export const loadFileUsageClass = (models: IModels) => {
  // Empty or 0 means no quota.
  const getQuotaBytes = async (): Promise<number | null> => {
    const quotaGb = Number(await getConfig('FILES_QUOTA_GB', '', models));

    return Number.isFinite(quotaGb) && quotaGb > 0 ? quotaGb * GB : null;
  };

  const ensureUsage = () =>
    models.FileUsage.updateOne(
      { _id: FILES_USAGE_ID },
      { $setOnInsert: { usedBytes: 0, reservedBytes: 0 } },
      { upsert: true },
    );

  const inc = (fields: Partial<Record<'usedBytes' | 'reservedBytes', number>>) =>
    models.FileUsage.updateOne(
      { _id: FILES_USAGE_ID },
      { $inc: fields },
      { upsert: true },
    );

  class FileUsageModel {
    public static async getUsage(): Promise<TFilesUsage> {
      const usage = await models.FileUsage.findOne({
        _id: FILES_USAGE_ID,
      }).lean<IFileUsageDocument | null>();

      return {
        usedBytes: Math.max(0, usage?.usedBytes || 0),
        reservedBytes: Math.max(0, usage?.reservedBytes || 0),
        quotaBytes: await getQuotaBytes(),
      };
    }

    public static async reserve(size: number) {
      const quotaBytes = await getQuotaBytes();

      if (quotaBytes === null) {
        await inc({ reservedBytes: size });
        return;
      }

      await ensureUsage();

      // One atomic write, so parallel uploads can't both take the last gap.
      const reserved = await models.FileUsage.findOneAndUpdate(
        {
          _id: FILES_USAGE_ID,
          $expr: {
            $lte: [
              { $add: ['$usedBytes', '$reservedBytes', size] },
              quotaBytes,
            ],
          },
        },
        { $inc: { reservedBytes: size } },
        { new: true },
      );

      if (!reserved) {
        throw new ExpectedError(
          'Storage quota exceeded. Free up space or ask an admin to raise the quota.',
          'FILES_QUOTA_EXCEEDED',
        );
      }
    }

    public static async release(size: number) {
      await inc({ reservedBytes: -size });
    }

    public static async commit(size: number) {
      await inc({ reservedBytes: -size, usedBytes: size });
    }

    public static async free(size: number) {
      await inc({ usedBytes: -size });
    }

    public static async reconcile(usedBytes: number, reservedBytes: number) {
      await models.FileUsage.updateOne(
        { _id: FILES_USAGE_ID },
        { $set: { usedBytes, reservedBytes } },
        { upsert: true },
      );
    }
  }

  fileUsageSchema.loadClass(FileUsageModel);

  return fileUsageSchema;
};
