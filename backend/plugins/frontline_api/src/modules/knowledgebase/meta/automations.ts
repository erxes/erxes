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

type TIndexableArticle = {
  _id: string;
  title?: string;
  summary?: string;
  content?: string;
  categoryId?: string;
  isPrivate?: boolean;
  modifiedDate?: Date;
  createdDate?: Date;
};

// Articles are often titled "1", "2", "3" with the real subject living on the
// category, so an article indexed on its own title matches nothing.
const findCategoryTitleById = async (
  models: IModels,
  articles: TIndexableArticle[],
) => {
  const categoryIds = [
    ...new Set(
      articles
        .map((article) => article.categoryId)
        .filter((categoryId): categoryId is string => !!categoryId),
    ),
  ];

  if (!categoryIds.length) {
    return new Map<string, string>();
  }

  const categories = await models.Category.find(
    { _id: { $in: categoryIds } },
    { title: 1 },
  ).lean<Array<{ _id: string; title?: string }>>();

  return new Map(
    categories
      .filter((category) => category.title?.trim())
      .map((category) => [category._id, (category.title as string).trim()]),
  );
};

const toKnowledgeDocument = (
  article: TIndexableArticle,
  categoryTitle?: string,
): TKnowledgeDocument => ({
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
  title:
    [categoryTitle, article.title].filter(Boolean).join(' › ') ||
    'Untitled knowledge base article',
  content: [article.summary, article.content].filter(Boolean).join('\n\n'),
  contentFormat: 'html',
  metadata: {
    visibility: article.isPrivate ? 'internal' : 'public',
    ...(categoryTitle ? { keywords: [categoryTitle] } : {}),
  },
});

const toKnowledgeDocuments = async (
  models: IModels,
  articles: TIndexableArticle[],
) => {
  const categoryTitleById = await findCategoryTitleById(models, articles);

  return articles
    .map((article) =>
      toKnowledgeDocument(
        article,
        article.categoryId
          ? categoryTitleById.get(article.categoryId)
          : undefined,
      ),
    )
    .filter((document) => document.content.trim().length > 0);
};

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
        documents: await toKnowledgeDocuments(models, articles),
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
    const documents = await toKnowledgeDocuments(models, articles);

    return {
      documents,
      totalCount: sourceIds.length,
      nextCursor: nextIndex < sourceIds.length ? String(nextIndex) : undefined,
      hasMore: nextIndex < sourceIds.length,
    };
  },
};
