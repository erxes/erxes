import {
  checkPermission,
  moduleRequireLogin,
} from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITopicDocument } from '@/knowledgebase/@types/knowledgebase';

const findDetail = async (model, _id) => {
  return await model.findOne({ $or: [{ _id }, { code: _id }] });
};

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

const knowledgeBaseQueries = {
  /**
   * Article list
   */
  async knowledgeBaseArticles(_root, args, { models }: IContext) {
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

    const { list, totalCount, pageInfo } = await cursorPaginate<ITopicDocument>(
      {
        model: models.KnowledgeBaseArticles,
        params: args,
        query: selector,
      },
    );

    return { list, totalCount, pageInfo };
  },

  /**
   * Article detail
   */
  async knowledgeBaseArticleDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return findDetail(models.KnowledgeBaseArticles, _id);
  },

  /**
   * Article detail anc increase a view count
   */
  async knowledgeBaseArticleDetailAndIncViewCount(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.KnowledgeBaseArticles.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
      { new: true },
    );
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
  async knowledgeBaseCategories(
    _root,
    args: {
      ids: string[];
      page: number;
      perPage: number;
      topicIds: string[];
      codes: string[];
      icon: string;
    },
    { models }: IContext,
  ) {
    const qry: any = buildQuery(args);

    const categories = models.KnowledgeBaseCategories.find(qry).sort({
      title: 1,
    });

    const { page, perPage } = args;

    if (!page && !perPage) {
      return categories;
    }

    // return paginate(categories, { page, perPage });
    return [];
  },

  /**
   * Category detail
   */
  async knowledgeBaseCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return findDetail(models.KnowledgeBaseCategories, _id);
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

    return { list, totalCount, pageInfo };
  },

  /**
   * Topic detail
   */
  async knowledgeBaseTopicDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return findDetail(models.KnowledgeBaseTopics, _id);
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
