import { KnowledgeBaseArticles } from '../../db/models';

export default {
  articles(category) {
    return KnowledgeBaseArticles.find({ articleId: { $in: category.articleIds } });
  },
};
