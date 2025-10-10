import {
  checkPermission,
  moduleRequireLogin,
} from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
} from '@/knowledgebase/@types/knowledgebase';

const buildQuery = (args: any) => {
  const qry: any = {};

  const keys = ['codes', 'categoryIds', 'articleIds', 'topicIds'];

  keys.forEach((key) => {
    if (args[key] && args[key].length > 0) {
      const field = key.replace('s', '');
      qry[field] = { $in: args[key] };
    }
  });

  if (args.searchValue && args.searchValue.trim()) {
    qry.$or = [
      { title: { $regex: `.*${args.searchValue.trim()}.*`, $options: 'i' } },
      { content: { $regex: `.*${args.searchValue.trim()}.*`, $options: 'i' } },
      { summary: { $regex: `.*${args.searchValue.trim()}.*`, $options: 'i' } },
    ];
  }

  if (args.brandId) {
    qry.brandId = args.brandId;
  }

  if (args.icon) {
    qry.icon = args.icon;
  }

  if (args?.ids?.length) {
    qry._id = { $in: args.ids };
  }

  if (args?.status) {
    qry.status = args.status;
  }

  return qry;
};

const knowledgeBaseQueries: any = {
  /**
   * Article list
   */
  async knowledgeBaseArticles(_root, args, { models }: IContext) {
    const language = args.language;
    const selector: any = buildQuery(args);
    let sort: any = { createdDate: -1 };

    if (args.topicIds && args.topicIds.length > 0) {
      const categoryIds = await models.KnowledgeBaseCategories.find({
        topicId: { $in: args.topicIds },
      }).distinct('_id');

      selector.categoryId = { $in: categoryIds };

      delete selector.topicIds;
    }

    if (args.sortField) {
      sort = { [args.sortField]: args.sortDirection };
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IArticleDocument>({
        model: models.KnowledgeBaseArticles,
        params: args,
        query: selector,
      });

    if (!language) {
      return { list, totalCount, pageInfo };
    }

    const articleIds = list.map((article) => article._id);

    const translations = await models.PostTranslations.find({
      postId: { $in: articleIds },
      language,
    }).lean();

    const articlesWithTranslations = list.map((article) => {
      const translation = translations.find(
        (translation) => translation.postId === article._id,
      );
      return {
        ...article,
        ...(translation && {
          title: translation.title || article.title,
          content: translation.content || article.content,
          summary: translation.excerpt || article.summary,
        }),
      };
    });

    return { list: articlesWithTranslations, totalCount, pageInfo };
  },

  /**
   * Article detail
   */
  async knowledgeBaseArticleDetail(
    _root,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    const article = await models.KnowledgeBaseArticles.findOne({ _id });

    if (!language) {
      return article;
    }

    if (!article) {
      throw new Error('Article not found');
    }

    const translation = await models.PostTranslations.findOne({
      postId: article._id,
      language,
    });

    return {
      ...article,
      ...(translation && {
        title: translation.title || article.title,
        content: translation.content || article.content,
        summary: translation.excerpt || article.summary,
      }),
    };
  },

  /**
   * Article detail anc increase a view count
   */
  async knowledgeBaseArticleDetailAndIncViewCount(
    _root,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    const article = await models.KnowledgeBaseArticles.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
      { new: true },
    );

    if (!language) {
      return article;
    }

    if (!article) {
      throw new Error('Article not found');
    }

    const translation = await models.PostTranslations.findOne({
      postId: article._id,
      language,
    });

    return {
      ...article,
      ...(translation && {
        title: translation.title || article.title,
        content: translation.content || article.content,
        summary: translation.excerpt || article.summary,
      }),
    };
  },

  /**
   * Total article count
   */
  async knowledgeBaseArticlesTotalCount(_root, args, { models }: IContext) {
    const qry: any = buildQuery(args);

    return models.KnowledgeBaseArticles.find(qry).countDocuments();
  },

  /**
   * Category list
   */
  async knowledgeBaseCategories(_root, args, { models }: IContext) {
    const qry: any = buildQuery(args);

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ICategoryDocument>({
        model: models.KnowledgeBaseCategories,
        params: args,
        query: qry,
      });

    if (!args.language) {
      return { list, totalCount, pageInfo };
    }

    const categoryIds = list.map((category) => category._id);
    const translations = await models.PostTranslations.find({
      postId: { $in: categoryIds },
      language: args.language,
    });

    const categoriesWithTranslations = list.map((category) => {
      const translation = translations.find(
        (translation) => translation.postId === category._id,
      );
      return {
        ...category,
        ...(translation && {
          title: translation.title || category.title,
          description: translation.content || category.description,
        }),
      };
    });

    return { list: categoriesWithTranslations, totalCount, pageInfo };
  },

  /**
   * Category detail
   */
  async knowledgeBaseCategoryDetail(
    _root,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    const category = await models.KnowledgeBaseCategories.findOne({ _id });

    if (!language) {
      return category;
    }

    if (!category) {
      throw new Error('Category not found');
    }

    const translation = await models.PostTranslations.findOne({
      postId: category._id,
      language,
    });

    return {
      ...category,
      ...(translation && {
        title: translation.title || category.title,
        description: translation.content || category.description,
      }),
    };
  },

  /**
   * Category total count
   */
  async knowledgeBaseCategoriesTotalCount(
    _root,
    args: { topicIds: string[]; codes: string[] },
    { models }: IContext,
  ) {
    const qry: any = buildQuery(args);

    return models.KnowledgeBaseCategories.find(qry).countDocuments();
  },

  /**
   * Get last category
   */
  async knowledgeBaseCategoriesGetLast(
    _root,
    _args,
    { commonQuerySelector, models }: IContext,
  ) {
    return models.KnowledgeBaseCategories.findOne(commonQuerySelector).sort({
      createdDate: -1,
    });
  },

  /**
   * Topic list
   */
  async knowledgeBaseTopics(_root, params, { models }: IContext) {
    const query: any = buildQuery(params);

    const { list, totalCount, pageInfo } = await cursorPaginate<ITopicDocument>(
      {
        model: models.KnowledgeBaseTopics,
        params,
        query,
      },
    );

    if (!params.language) {
      return { list, totalCount, pageInfo };
    }

    const topicIds = list.map((topic) => topic._id);
    const translations = await models.PostTranslations.find({
      postId: { $in: topicIds },
      language: params.language,
    });

    const topicsWithTranslations = list.map((topic) => {
      const translation = translations.find(
        (translation) => translation.postId === topic._id,
      );
      return {
        ...topic,
        ...(translation && {
          title: translation.title || topic.title,
          description: translation.content || topic.description,
        }),
      };
    });

    return { list: topicsWithTranslations, totalCount, pageInfo };
  },

  /**
   * Topic detail
   */
  async knowledgeBaseTopicDetail(
    _root,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    const topic = await models.KnowledgeBaseTopics.findOne({ _id });

    if (!language) {
      return topic;
    }

    if (!topic) {
      throw new Error('Topic not found');
    }

    const translation = await models.PostTranslations.findOne({
      postId: topic._id,
      language,
    });

    return {
      ...topic,
      ...(translation && {
        title: translation.title || topic.title,
        description: translation.content || topic.description,
      }),
    };
  },

  /**
   * Total topic count
   */
  async knowledgeBaseTopicsTotalCount(
    _root,
    _args,
    { commonQuerySelector, models }: IContext,
  ) {
    return models.KnowledgeBaseTopics.find(
      commonQuerySelector,
    ).countDocuments();
  },
};

moduleRequireLogin(knowledgeBaseQueries);

checkPermission(
  knowledgeBaseQueries,
  'knowledgeBaseArticles',
  'showKnowledgeBase',
  [],
);
checkPermission(
  knowledgeBaseQueries,
  'knowledgeBaseTopics',
  'showKnowledgeBase',
  [],
);
checkPermission(
  knowledgeBaseQueries,
  'knowledgeBaseCategories',
  'showKnowledgeBase',
  [],
);

export default knowledgeBaseQueries;
