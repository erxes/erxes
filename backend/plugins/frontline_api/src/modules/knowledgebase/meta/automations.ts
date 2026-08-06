import {
  buildKnowledgeSourceType,
  type TKnowledgeDocument,
} from 'erxes-api-shared/utils';
import type { TAutomationProducersInput } from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';

export const FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY =
  'knowledgebase.article';

const SCOPE_DEFAULT_LIMIT = 500;

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
  async loadAiKnowledgeDocumentBatch(
    {
      sourceKey,
      scope,
      sourceIds = [],
      candidateSourceIds = [],
      cursor,
      limit,
      skipTotalCount,
    }: TAutomationProducersInput['loadAiKnowledgeDocumentBatch'],
    { models }: { models: IModels },
  ) {
    if (sourceKey !== FRONTLINE_KNOWLEDGEBASE_ARTICLE_SOURCE_KEY) {
      throw new Error(`Unsupported AI knowledge source: ${sourceKey}`);
    }

    if (scope === 'all') {
      const scopeLimit = Math.min(
        Math.max(Math.floor(limit || SCOPE_DEFAULT_LIMIT), 1),
        5000,
      );
      // A single-document refresh narrows the scope to the changed article.
      const publishedSelector = {
        status: 'publish',
        ...(candidateSourceIds.length
          ? { _id: { $in: candidateSourceIds } }
          : {}),
      };
      const [totalCount, articles] = await Promise.all([
        skipTotalCount
          ? Promise.resolve(0)
          : models.Article.countDocuments(publishedSelector),
        models.Article.find({
          ...publishedSelector,
          ...(cursor ? { _id: { $gt: cursor } } : {}),
        })
          .sort({ _id: 1 })
          .limit(scopeLimit)
          .lean(),
      ]);
      const hasMore = articles.length === scopeLimit;

      return {
        documents: articles
          .map(toKnowledgeDocument)
          .filter((article) => article.content.trim().length > 0),
        totalCount,
        nextCursor: hasMore ? articles[articles.length - 1]?._id : undefined,
        hasMore,
      };
    }

    if (!sourceIds.length) {
      return {
        documents: [],
        totalCount: 0,
        hasMore: false,
      };
    }

    const startIndex = Math.max(Number(cursor || 0) || 0, 0);
    const batchLimit = Math.min(
      Math.max(Math.floor(limit || sourceIds.length), 1),
      5000,
    );
    const batchSourceIds = sourceIds.slice(startIndex, startIndex + batchLimit);

    const articles = await models.Article.find({
      _id: { $in: batchSourceIds },
      status: 'publish',
    }).lean();
    const nextIndex = startIndex + batchLimit;
    const documents = articles
      .map(toKnowledgeDocument)
      .filter((article) => article.content.trim().length > 0);

    return {
      documents,
      totalCount: sourceIds.length,
      nextCursor: nextIndex < sourceIds.length ? String(nextIndex) : undefined,
      hasMore: nextIndex < sourceIds.length,
    };
  },
};
