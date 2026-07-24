import { Model } from 'mongoose';
import {
  ADJ_FXA_STATUSES,
  IAdjustFixedAsset,
  IAdjustFixedAssetDocument,
  IAdjustFxaDetail,
  IAdjustFxaDetailDocument,
} from '../../@types/adjustFixedAsset';
import {
  adjustFixedAssetSchema,
  adjustFxaDetailSchema,
} from '../definitions/fixedAsset';
import { IModels } from '~/connectionResolvers';

export interface IAdjustFixedAssetModel extends Model<IAdjustFixedAssetDocument> {
  getAdjustFixedAsset(_id: string): Promise<IAdjustFixedAssetDocument>;
  createAdjustFixedAsset(
    doc: IAdjustFixedAsset,
  ): Promise<IAdjustFixedAssetDocument>;
  updateAdjustFixedAsset(
    _id: string,
    doc: Partial<IAdjustFixedAsset>,
  ): Promise<IAdjustFixedAssetDocument>;
  removeAdjustFixedAsset(_id: string): Promise<string>;
}

export interface IAdjustFxaDetailModel extends Model<IAdjustFxaDetailDocument> {
  replaceAdjustFxaDetails(args: {
    adjustId: string;
    details: IAdjustFxaDetail[];
  }): Promise<void>;
}

export const loadAdjustFixedAssetClass = (models: IModels) => {
  class AdjustFixedAsset {
    public static async getAdjustFixedAsset(_id: string) {
      const adjusting = await models.AdjustFixedAssets.findOne({ _id }).lean();

      if (!adjusting) {
        throw new Error('Adjust fixed asset not found');
      }

      return adjusting;
    }

    public static async createAdjustFixedAsset(doc: IAdjustFixedAsset) {
      return models.AdjustFixedAssets.create({
        ...doc,
        status: ADJ_FXA_STATUSES.DRAFT,
        createdAt: new Date(),
      });
    }

    public static async updateAdjustFixedAsset(
      _id: string,
      doc: Partial<IAdjustFixedAsset>,
    ) {
      await models.AdjustFixedAssets.getAdjustFixedAsset(_id);

      await models.AdjustFixedAssets.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      return models.AdjustFixedAssets.getAdjustFixedAsset(_id);
    }

    public static async removeAdjustFixedAsset(_id: string) {
      const adjusting = await models.AdjustFixedAssets.getAdjustFixedAsset(_id);

      if (
        ![ADJ_FXA_STATUSES.DRAFT, ADJ_FXA_STATUSES.PROCESS].includes(
          adjusting.status,
        )
      ) {
        throw new Error('This fixed asset adjustment cannot be deleted.');
      }

      await models.AdjustFxaDetails.deleteMany({ adjustId: _id });
      await models.AdjustFixedAssets.deleteOne({ _id });

      return 'success delete';
    }
  }

  adjustFixedAssetSchema.loadClass(AdjustFixedAsset);

  return adjustFixedAssetSchema;
};

export const loadAdjustFxaDetailClass = (models: IModels) => {
  class AdjustFxaDetail {
    public static async replaceAdjustFxaDetails({
      adjustId,
      details,
    }: {
      adjustId: string;
      details: IAdjustFxaDetail[];
    }) {
      await models.AdjustFxaDetails.deleteMany({ adjustId });

      if (!details.length) {
        return;
      }

      await models.AdjustFxaDetails.insertMany(
        details.map((detail) => ({
          ...detail,
          adjustId,
          createdAt: new Date(),
        })),
      );
    }
  }

  adjustFxaDetailSchema.loadClass(AdjustFxaDetail);

  return adjustFxaDetailSchema;
};
