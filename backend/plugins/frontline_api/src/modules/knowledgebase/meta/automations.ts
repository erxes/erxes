import {
  buildKnowledgeSourceType,
  type TKnowledgeDocument,
} from 'erxes-api-shared/utils';
import type { TAutomationProducersInput } from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';

export const FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY =
  'knowledgebase.article';

const getKnowledgeArticleUpdatedAt = (article: {
  modifiedDate?: Date;
  createdDate?: Date;
}) => (article.modifiedDate || article.createdDate || new Date()).toISOString();

const toKnowledgeDocument = (article: {
  _id: string;
  title?: string;
  summary?: string;
  content?: string;
  isPrivate?: boolean;
  modifiedDate?: Date;
  createdDate?: Date;
}): TKnowledgeDocument => ({
  source: {
    type: buildKnowledgeSourceType({
      pluginName: 'frontline',
      moduleName: 'knowledgebase',
      key: FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY,
    }),
    id: article._id,
    version: getKnowledgeArticleUpdatedAt(article),
    updatedAt: getKnowledgeArticleUpdatedAt(article),
  },
  title: article.title || 'Untitled knowledge base article',
  content: [article.summary, article.content].filter(Boolean).join('\n\n'),
  contentFormat: 'html',
  metadata: {
    visibility: article.isPrivate ? 'internal' : 'public',
  },
});

export const frontlineAiKnowledgeProvider = {
  async loadAiKnowledgeDocuments(
    {
      sourceKey,
      sourceIds,
    }: TAutomationProducersInput['loadAiKnowledgeDocuments'],
    { models }: { models: IModels },
  ) {
    if (sourceKey !== FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY) {
      throw new Error(`Unsupported AI knowledge source: ${sourceKey}`);
    }

    const articles = await models.Article.find({
      _id: { $in: sourceIds },
      status: 'publish',
    }).lean();

    return articles
      .map(toKnowledgeDocument)
      .filter((article) => article.content.trim().length > 0);
  },
};
