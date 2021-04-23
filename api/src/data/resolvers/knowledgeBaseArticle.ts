import { IArticleDocument } from '../../db/models/definitions/knowledgebase';
import { getDocument } from './mutations/cacheUtils';

export default {
  createdUser(article: IArticleDocument) {
    return getDocument('users', { _id: article.createdBy });
  }
};
