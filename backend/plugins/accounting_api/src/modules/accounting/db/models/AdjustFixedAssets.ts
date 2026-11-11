import { JOURNALS, TR_SIDES } from '../../@types/constants';
import { graphqlPubsub } from 'erxes-api-shared/utils';
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
} from '../definitions/adjustFixedAsset';
import { IModels } from '~/connectionResolvers';

export interface IAdjustFixedAssetModel
  extends Model<IAdjustFixedAssetDocument> {
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

export const loadAdjustFixedAssetClass = (
  models: IModels,
  subdomain: string,
) => {
  // skipcq: JS-0327
  class AdjustFixedAsset {
    public static async getAdjustFixedAsset(_id: string) {
      const adjusting = await models.AdjustFixedAssets.findOne({ _id }).lean();

      if (!adjusting) {
        throw new Error('Adjust fixed asset not found');
      }

      return adjusting;
    }

    public static async createAdjustFixedAsset(doc: IAdjustFixedAsset) {
      const previous = await models.AdjustFixedAssets.findOne({
        expenseAccountId: { $exists: true, $nin: ['', null] },
      })
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean();
      const previousTransaction =
        previous?.expenseAccountId || doc.expenseAccountId
          ? undefined
          : await models.Transactions.findOne({
              contentType: 'accounting:adjustFixedAsset',
              journal: JOURNALS.FXA_DEP,
              side: TR_SIDES.DEBIT,
            })
              .sort({ date: -1, createdAt: -1 })
              .lean();
      return models.AdjustFixedAssets.create({
        ...doc,
        expenseAccountId:
          doc.expenseAccountId ||
          previous?.expenseAccountId ||
          previousTransaction?.details[0]?.accountId,
        status: ADJ_FXA_STATUSES.DRAFT,
        createdAt: new Date(),
      });
    }

    public static async updateAdjustFixedAsset(
      _id: string,
      doc: Partial<IAdjustFixedAsset>,
    ) {
      await models.AdjustFixedAssets.getAdjustFixedAsset(_id);
      const $set: Record<string, unknown> = { updatedAt: new Date() };
      const $unset: Record<string, string> = {};

      for (const [field, value] of Object.entries(doc)) {
        if (value === undefined) {
          $unset[field] = '';
          continue;
        }

        $set[field] = value;
      }

      await models.AdjustFixedAssets.updateOne(
        { _id },
        Object.keys($unset).length ? { $set, $unset } : { $set },
      );

      const adjust = await models.AdjustFixedAssets.getAdjustFixedAsset(_id);

      graphqlPubsub.publish(
        `accountingAdjustFixedAssetChanged:${subdomain}:${_id}`,
        {
          accountingAdjustFixedAssetChanged: adjust,
        },
      );

      return adjust;
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

      const linkedTransaction = await models.Transactions.findOne({
        contentType: 'accounting:adjustFixedAsset',
        contentId: _id,
      }).lean();
      if (linkedTransaction) {
        throw new Error(
          'Clear the linked depreciation transactions before deleting this adjustment.',
        );
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
  // skipcq: JS-0327
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
