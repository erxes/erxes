import { KnowledgeBaseArticles } from '../../db/models';

export default {
  articles(category) {
    return KnowledgeBaseArticles.find({ _id: { $in: category.articleIds } });
  },
};
