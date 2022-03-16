import { IArticleDocument } from '../../models/definitions/knowledgebase';
import { getDocument } from '../../cacheUtils';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.KnowledgeBaseArticles.findOne({ _id });
  },

  createdUser(article: IArticleDocument, _args, { coreModels }: IContext) {
    return getDocument(coreModels, 'users', { _id: article.createdBy });
  },
};
