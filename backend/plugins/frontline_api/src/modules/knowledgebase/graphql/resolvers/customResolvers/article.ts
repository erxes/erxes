import { IArticleDocument } from '@/knowledgebase/@types/article';
import { IContext } from '~/connectionResolvers'

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Article.findOne({ _id });
  },

  createdUser(article: IArticleDocument, _args) {
    return {
      __typename: 'User',
      _id: article.createdBy
    };
  },
  publishedUser(article: IArticleDocument, _args) {
    return article?.publishedUserId
      ? {
          __typename: 'User',
          _id: article?.publishedUserId
        }
      : null;
  }
};
