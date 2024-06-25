import { IKBArticleHistoryDocument } from '../../../common/types/asset';
import { IContext } from '../../../connectionResolver';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.AssetsKbArticlesHistories.findOne({ _id });
  },

  async user(
    history: IKBArticleHistoryDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (history.userId && dataLoaders.teamMember.load(history.userId)) || null
    );
  },

  async asset(
    history: IKBArticleHistoryDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (history.assetId && dataLoaders.asset.load(history.assetId)) || null;
  },

  async article(
    { kbArticleId }: IKBArticleHistoryDocument,
    {},
    { dataLoaders }: IContext
  ) {
    const article = await dataLoaders.kbArticles.load(kbArticleId);

    if (!article) {
      return null;
    }

    article.category =
      (article.categoryId &&
        (await dataLoaders.kbCategory.load(article.categoryId))) ||
      null;

    return article;
  }
};
