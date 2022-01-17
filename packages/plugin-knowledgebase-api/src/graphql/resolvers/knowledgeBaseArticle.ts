import { IArticleDocument } from '../../models/definitions/knowledgebase';
import { getDocument } from '../../cacheUtils';

export default {
  createdUser(article: IArticleDocument) {
    return getDocument('users', { _id: article.createdBy });
  },
};
