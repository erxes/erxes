import { IContext } from '~/connectionResolvers';
import { IArticleDocument } from '@/knowledgebase/@types/knowledgebase';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.KnowledgeBaseArticles.findOne({ _id });
  },

  async createdUser(article: IArticleDocument) {
    if (!article.createdBy) {
      return null;
    }

    return {
      _id: article.createdBy,
      __typename: 'User',
    };
  },
  publishedUser(article: IArticleDocument) {
    if (!article.publishedUserId) {
      return null;
    }
    return sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { query: { _id: article.publishedUserId } },
    });
  },
};
