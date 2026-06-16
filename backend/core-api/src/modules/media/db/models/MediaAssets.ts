import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { mediaAssetSchema } from '~/modules/media/db/definitions/mediaAssets';
import { IMediaAsset, IMediaAssetDocument } from '~/modules/media/types';

export interface IMediaAssetModel extends Model<IMediaAssetDocument> {
  createAsset(doc: IMediaAsset): Promise<IMediaAssetDocument>;
  getAsset(_id: string): Promise<IMediaAssetDocument>;
  updateAsset(
    _id: string,
    doc: Partial<
      Pick<IMediaAsset, 'name' | 'title' | 'alt' | 'caption' | 'description'>
    >,
  ): Promise<IMediaAssetDocument>;
  removeAsset(_id: string): Promise<IMediaAssetDocument>;
  listAssets(args: {
    searchValue?: string;
    fileType?: string;
    limit?: number;
    skip?: number;
  }): Promise<IMediaAssetDocument[]>;
}

export const loadMediaAssetClass = (models: IModels) => {
  class MediaAsset {
    public static async createAsset(doc: IMediaAsset) {
      return models.MediaAssets.create(doc);
    }

    public static async getAsset(_id: string) {
      const asset = await models.MediaAssets.findOne({
        _id,
        deletedAt: { $exists: false },
      });

      if (!asset) {
        throw new Error('Media asset not found');
      }

      return asset;
    }

    public static async updateAsset(
      _id: string,
      doc: Partial<
        Pick<IMediaAsset, 'name' | 'title' | 'alt' | 'caption' | 'description'>
      >,
    ) {
      const asset = await models.MediaAssets.findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
        { $set: doc },
        { new: true },
      );

      if (!asset) {
        throw new Error('Media asset not found');
      }

      return asset;
    }

    public static async removeAsset(_id: string) {
      const asset = await models.MediaAssets.findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: new Date() } },
        { new: true },
      );

      if (!asset) {
        throw new Error('Media asset not found');
      }

      return asset;
    }

    public static async listAssets({
      searchValue,
      fileType,
      limit = 50,
      skip = 0,
    }: {
      searchValue?: string;
      fileType?: string;
      limit?: number;
      skip?: number;
    }) {
      const selector: Record<string, any> = {
        deletedAt: { $exists: false },
      };

      if (fileType) {
        selector.fileType = fileType;
      }

      if (searchValue) {
        selector.$text = { $search: searchValue };
      }

      return models.MediaAssets.find(selector)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(limit, 100));
    }
  }

  mediaAssetSchema.loadClass(MediaAsset);

  return mediaAssetSchema;
};
