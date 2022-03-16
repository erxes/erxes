import { IArticleDocument } from '../../models/definitions/knowledgebase';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.KnowledgeBaseArticles.findOne({ _id });
  },

  createdUser(article: IArticleDocument, _args) {
    return {
      __typename: "User",
      _id: article.createdBy
    }
  },
};
