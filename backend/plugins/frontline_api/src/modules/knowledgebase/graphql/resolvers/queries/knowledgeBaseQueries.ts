import { defaultPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  getQueryBuilder,
  QueryBuilderArgs,
} from '@/knowledgebase/utils/query-builders';

const findDetail = async (model, _id) => {
  return await model.findOne({ $or: [{ _id }, { code: _id }] });
};

export const knowledgeBaseQueries = {

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
    const queryBuilder = getQueryBuilder('article', models);
    const selector: any = await queryBuilder.buildQuery(args);
    let sort: any = { createdDate: -1 };

    const pageArgs = { page: args.page, perPage: args.perPage };

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
    args: QueryBuilderArgs,
    { models }: IContext
  ) {
    const queryBuilder = getQueryBuilder('article', models);
    const qry: any = await queryBuilder.buildQuery(args);

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
    const queryBuilder = getQueryBuilder('category', models);
    const qry: any = queryBuilder.buildQuery(args);

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
    const queryBuilder = getQueryBuilder('category', models);
    const qry: any = queryBuilder.buildQuery(args);

    return models.Category.find(qry).countDocuments();
  },


  async knowledgeBaseCategoriesGetLast(
    _root,
    _args,
    { models }: IContext
  ) {
    return models.Category
      .findOne({})
      .sort({ createdDate: -1 });
  },

  async knowledgeBaseTopics(
    _root,
    args: QueryBuilderArgs,
    { models }: IContext
  ) {
    const queryBuilder = getQueryBuilder('topic', models);
    const qry: any = queryBuilder.buildQuery(args);
  
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

  async cpknowledgeBaseTopics(_root: any, args: QueryBuilderArgs, context: IContext) {
    const { models, clientPortal } = context;

    const queryBuilder = getQueryBuilder('topic', models);
    const query: any = queryBuilder.buildQuery({
      ...args,
      clientPortalId: clientPortal._id,
    });

    const topics = models.Topic.find(query).sort({ modifiedDate: -1 });

    return defaultPaginate(topics, args);
  },

};

(knowledgeBaseQueries as any).cpknowledgeBaseTopics.wrapperConfig = {
  forClientPortal: true,
};

export default knowledgeBaseQueries;
