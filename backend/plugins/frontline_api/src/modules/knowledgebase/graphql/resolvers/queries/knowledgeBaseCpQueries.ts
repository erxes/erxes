import {
  defaultPaginate,
  escapeRegExp,
  markResolvers,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';

const buildQuery = (args: any) => {
  const qry: any = {};

  const keys = ['codes', 'categoryIds', 'articleIds', 'topicIds'];

  keys.forEach((key) => {
    if (args[key] && args[key].length > 0) {
      const field = key.replace('s', '');
      qry[field] = { $in: args[key] };
    }
  });

  const searchValue = args.searchValue?.trim();
  if (searchValue) {
    const safeSearch = escapeRegExp(searchValue);
    qry.$or = [
      { title: { $regex: `.*${safeSearch}.*`, $options: 'i' } },
      { description: { $regex: `.*${safeSearch}.*`, $options: 'i' } },
      { code: { $regex: `.*${safeSearch}.*`, $options: 'i' } },
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

export const knowledgeBaseCpQueries: Record<string, Resolver> = {
  async cpKnowlegdeBaseTopics(
    _root,
    args: {
      page: number;
      perPage: number;
      searchValue?: string;
      brandId?: string;
      codes?: string[];
    },
    { models, clientPortal }: IContext,
  ): Promise<any> {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const qry: any = buildQuery(args);

    qry.clientPortalId = clientPortal._id;

    const topics = models.Topic.find(qry).sort({ modifiedDate: -1 });

    return defaultPaginate(topics, args);
  },

  async cpKnowledgeBaseTopicDetail(
    _root,
    { _id }: { _id: string },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    return models.Topic.findOne({
      clientPortalId: clientPortal._id,
      $or: [{ _id }, { code: _id }],
    });
  },

  async cpKnowledgeBaseTopicsTotalCount(
    _root,
    args: {
      searchValue?: string;
      brandId?: string;
      codes?: string[];
    },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const qry: any = buildQuery(args);

    qry.clientPortalId = clientPortal._id;

    return models.Topic.find(qry).countDocuments();
  },

  async cpKnowledgeBaseCategories(
    _root,
    args: {
      ids?: string[];
      page?: number;
      perPage?: number;
      topicIds?: string[];
      codes?: string[];
      icon?: string;
    },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const qry: any = buildQuery(args);

    const portalTopicIds: string[] = await models.Topic.find({
      clientPortalId: clientPortal._id,
    }).distinct('_id');

    if (!portalTopicIds.length) {
      return args.page && args.perPage ? [] : [];
    }

    if (args.topicIds?.length) {
      const scopedTopicIds = args.topicIds.filter((id) =>
        portalTopicIds.some((pid) => pid.toString() === id.toString()),
      );

      if (!scopedTopicIds.length) {
        return args.page && args.perPage ? [] : [];
      }

      qry.topicId = { $in: scopedTopicIds };
    } else {
      qry.topicId = { $in: portalTopicIds };
    }

    const categoriesQuery = models.Category.find(qry).sort({ title: 1 });

    const { page, perPage } = args;

    if (!page && !perPage) {
      return categoriesQuery;
    }

    return defaultPaginate(categoriesQuery, { page, perPage });
  },

  async cpKnowledgeBaseCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const category = await models.Category.findOne({
      $or: [{ _id }, { code: _id }],
    });

    if (!category) {
      return null;
    }

    const topic = await models.Topic.findOne({
      _id: category.topicId,
      clientPortalId: clientPortal._id,
    });

    if (!topic) {
      return null;
    }

    return category;
  },

  async cpKnowledgeBaseCategoriesTotalCount(
    _root,
    args: { topicIds?: string[]; codes?: string[] },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const qry: any = buildQuery(args);

    const topicIds = await models.Topic.find({
      clientPortalId: clientPortal._id,
    }).distinct('_id');

    if (topicIds.length > 0) {
      qry.topicId = { $in: topicIds };
    }

    return models.Category.find(qry).countDocuments();
  },

  async cpKnowledgeBaseCategoriesGetLast(
    _root,
    _args,
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const topicIds = await models.Topic.find({
      clientPortalId: clientPortal._id,
    }).distinct('_id');

    if (!topicIds.length) {
      return null;
    }

    return models.Category.findOne({ topicId: { $in: topicIds } }).sort({
      createdDate: -1,
    });
  },

  async cpKnowledgeBaseArticles(
    _root,
    args: {
      page: number;
      perPage: number;
      searchValue?: string;
      categoryIds?: string[];
      articleIds?: string[];
      codes?: string[];
      topicIds?: string[];
      sortField?: string;
      sortDirection?: number;
      status?: string;
    },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const selector: any = buildQuery(args);
    let sort: any = { createdDate: -1 };

    const pageArgs = { page: args.page, perPage: args.perPage };

    if (args.topicIds && args.topicIds.length > 0) {
      const categoryIds = await models.Category.find({
        topicId: { $in: args.topicIds },
      }).distinct('_id');

      selector.categoryId = { $in: categoryIds };

      delete selector.topicId;
    }

    if (args.sortField) {
      sort = { [args.sortField]: args.sortDirection };
    }

    const topicIds = await models.Topic.find({
      clientPortalId: clientPortal._id,
    }).distinct('_id');

    if (!topicIds.length) {
      return defaultPaginate(
        models.Article.find({ _id: { $in: [] } }),
        pageArgs,
      );
    }
    selector.topicId = { $in: topicIds };

    const articles = models.Article.find(selector).sort(sort);

    return defaultPaginate(articles, pageArgs);
  },

  async cpKnowledgeBaseArticleDetail(
    _root,
    { _id }: { _id: string },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const article = await models.Article.findOne({
      $or: [{ _id }, { code: _id }],
    });

    if (!article) {
      return null;
    }

    const topic = await models.Topic.findOne({
      _id: article.topicId,
      clientPortalId: clientPortal._id,
    });

    if (!topic) {
      return null;
    }

    return article;
  },

  async cpKnowledgeBaseArticleDetailAndIncViewCount(
    _root,
    { _id }: { _id: string },
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const article = await models.Article.findOne({ _id });

    if (!article) {
      return null;
    }

    const topic = await models.Topic.findOne({
      _id: article.topicId,
      clientPortalId: clientPortal._id,
    });

    if (!topic) {
      return null;
    }

    return models.Article.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
      { new: true },
    );
  },

  async cpKnowledgeBaseArticlesTotalCount(
    _root,
    args: any,
    { models, clientPortal }: IContext,
  ) {
    if (!clientPortal?._id) {
      throw new Error('Client portal is required');
    }

    const qry: any = buildQuery(args);

    const topicIds = await models.Topic.find({
      clientPortalId: clientPortal._id,
    }).distinct('_id');

    if (!topicIds.length) {
      return 0;
    }
    qry.topicId = { $in: topicIds };
    return models.Article.find(qry).countDocuments();
  },
};

markResolvers(knowledgeBaseCpQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
