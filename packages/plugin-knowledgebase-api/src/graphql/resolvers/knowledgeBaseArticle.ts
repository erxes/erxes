import { IArticleDocument } from '../../models/definitions/knowledgebase';
import { getDocument } from '../../cacheUtils';
import { IContext } from '../../connectionResolver';

export default {
  createdUser(article: IArticleDocument, _args, { coreModels }: IContext) {
    return getDocument(coreModels, 'users', { _id: article.createdBy });
  },
};
