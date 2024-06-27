import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { ASSET_KB_ARTICLE_HISTORY_ACTIONS } from '../common/constant/asset';
import {
  IAssetDocument,
  IKBArticleHistoryDocument
} from '../common/types/asset';
import { IModels } from '../connectionResolver';
import { assetKbArticlesHistoriesSchema } from './definitions/assets';

type KbArticleHistoryAction =
  | typeof ASSET_KB_ARTICLE_HISTORY_ACTIONS.ADDED
  | typeof ASSET_KB_ARTICLE_HISTORY_ACTIONS.REMOVED;

type SuccessMessage = { status: 'success' };

type AddAssetsKbArticleHistories = {
  assetIds: string[];
  kbArticleIds: string[];
  user: IUserDocument;
  action: string;
};

type AddKbArticleHistories = {
  asset: IAssetDocument;
  kbArticleIds: string[];
  user: IUserDocument;
  action: KbArticleHistoryAction;
};

export interface IAssetKbArticlHistoriesModel
  extends Model<IKBArticleHistoryDocument> {
  addAssetsKbArticleHistories(
    props: AddAssetsKbArticleHistories
  ): Promise<SuccessMessage>;

  addKbArticleHistories(props: AddKbArticleHistories): Promise<SuccessMessage>;
}

export const loadKBArticlHistoriesClass = (
  models: IModels,
  _subdomain: string
) => {
  // The _subdomain parameter is unused but required for function signature compatibility.

  class KBArticlHistories {
    public static async addAssetsKbArticleHistories({
      assetIds,
      action,
      kbArticleIds,
      user
    }: AddAssetsKbArticleHistories): Promise<SuccessMessage> {
      const assets = await models.Assets.find({ _id: { $in: assetIds } });

      const historyAction =
        action === 'add'
          ? ASSET_KB_ARTICLE_HISTORY_ACTIONS.ADDED
          : ASSET_KB_ARTICLE_HISTORY_ACTIONS.REMOVED;

      await Promise.all(
        assets.map(async (asset) => {
          await models.AssetsKbArticlesHistories.addKbArticleHistories({
            asset,
            kbArticleIds,
            user,
            action: historyAction
          });
        })
      );

      return { status: 'success' };
    }

    public static async addKbArticleHistories({
      asset,
      kbArticleIds,
      user,
      action
    }: AddKbArticleHistories): Promise<SuccessMessage> {
      const commonDoc = {
        userId: user._id,
        assetId: asset._id,
        action
      };

      let removedArticleIds: string[] = [];

      if (action === 'added') {
        kbArticleIds = kbArticleIds.filter(
          (kbArticleId) => !(asset?.kbArticleIds || []).includes(kbArticleId)
        );

        removedArticleIds = (asset?.kbArticleIds || []).filter(
          (kbArticleId) => !kbArticleIds.includes(kbArticleId)
        );
      }

      const docs = [
        ...kbArticleIds.map((kbArticleId) => ({ ...commonDoc, kbArticleId })),
        ...removedArticleIds.map((kbArticleId) => ({
          ...commonDoc,
          kbArticleId,
          action: ASSET_KB_ARTICLE_HISTORY_ACTIONS.REMOVED
        }))
      ];

      await models.AssetsKbArticlesHistories.insertMany(docs);

      return { status: 'success' };
    }
  }

  assetKbArticlesHistoriesSchema.loadClass(KBArticlHistories);

  return assetKbArticlesHistoriesSchema;
};
