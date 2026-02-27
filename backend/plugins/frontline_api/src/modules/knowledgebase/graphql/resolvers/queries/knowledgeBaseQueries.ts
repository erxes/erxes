
import { defaultPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import { da } from 'date-fns/locale';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

export const knowledgeBaseQueries: Record<string, Resolver> = {

  async knowledgeBaseArticles(
    _root,
    args: {
      page: number;
      perPage: number;
      searchValue?: string;
      categoryIds: string[];
      articleIds: string[];
      codes: string[];
      topicIds: string[];
      sortField?: string;
      sortDirection?: number;
      status?: string;
    },
    { models }: IContext
  ) {
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

    const articles = models.Article.find(selector).sort(sort);

    return defaultPaginate(articles, pageArgs);
  },

  async knowledgeBaseArticleDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return findDetail(models.Article, _id);
  },

  async knowledgeBaseArticleDetailAndIncViewCount(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Article.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  },

  async knowledgeBaseArticlesTotalCount(
    _root,
    args,
    { models }: IContext
  ) {
    const qry: any = buildQuery(args);

    return models.Article.find(qry).countDocuments();
  },

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
    { models }: IContext
  ) {
    const qry: any = buildQuery(args);

    const categories = models.Category.find(qry).sort({
      title: 1,
    });

    const { page, perPage } = args;

    if (!page && !perPage) {
      return categories;
    }

    return defaultPaginate(categories, { page, perPage });
  },

  async knowledgeBaseCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return findDetail(models.Category, _id);
  },

  async knowledgeBaseCategoriesTotalCount(
    _root,
    args: { topicIds: string[]; codes: string[] },
    { models }: IContext
  ) {
    const qry: any = buildQuery(args);

    return models.Category.find(qry).countDocuments();
  },


  async knowledgeBaseCategoriesGetLast(
    _root,
    _args,
    { models }: IContext
  ) {
    return models.Category.findOne({}).sort({ createdDate: -1 });
  },

  async knowledgeBaseTopics(
    _root,
    args: {
      page: number;
      perPage: number;
      searchValue?: string;
      brandId?: string;
      codes?: string[];
    },
    { models }: IContext
  ) {
    const qry: any = buildQuery(args);
  
    const topics = models.Topic.find(qry)
      .sort({ modifiedDate: -1 });
  
    return defaultPaginate(topics, args);
  },

  async knowledgeBaseTopicDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return findDetail(models.Topic, _id);
  },

  async knowledgeBaseTopicsTotalCount(
    _root,
    _args,
    { models }: IContext
  ) {
    return models.Topic.countDocuments({});
  },

}

