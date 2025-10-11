import { IContext } from '~/connectionResolvers';
import { BaseQueryResolver, FIELD_MAPPINGS } from '@/portal/utils/base-resolvers';
import { getQueryBuilder } from '@/portal/utils/query-builders';
import { PermissionManager } from '@/portal/utils/permission-utils';
import {
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
} from '@/knowledgebase/@types/knowledgebase';

class KnowledgeBaseQueryResolver extends BaseQueryResolver {

  /**
   * Article list
   */
  async knowledgeBaseArticles(_root: any, args: any, { models }: IContext) {
    const queryBuilder = getQueryBuilder('knowledgebase', models);
    const selector = await queryBuilder.buildArticleQuery(args);
    let sort: any = { createdDate: -1 };
  
    if (args.sortField) {
      sort = { [args.sortField]: args.sortDirection };
    }
  
    const { list, totalCount, pageInfo } = await this.getListWithTranslations(
      models.KnowledgeBaseArticles,
      selector,
      args,
      FIELD_MAPPINGS.KNOWLEDGE_BASE_ARTICLE
    );
  
    return { list, totalCount, pageInfo };
  }
  
  /**
   * Article detail
   */
  async knowledgeBaseArticleDetail(
    _root: any,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    return this.getItemWithTranslation(
      models.KnowledgeBaseArticles,
      { _id },
      language,
      FIELD_MAPPINGS.KNOWLEDGE_BASE_ARTICLE
    );
  }

  /**
   * Article detail and increase view count
   */
  async knowledgeBaseArticleDetailAndIncViewCount(
    _root: any,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    const article = await models.KnowledgeBaseArticles.findOneAndUpdate(
      { _id },
      { $inc: { viewCount: 1 } },
      { new: true },
    );

    if (!article) {
      throw new Error('Article not found');
    }

    if (!language) {
      return article;
    }

    const translation = await this.getTranslation(article._id, language);
    return this.applyTranslationsToItem(article, translation, FIELD_MAPPINGS.KNOWLEDGE_BASE_ARTICLE);
  }

  /**
   * Total article count
   */
  async knowledgeBaseArticlesTotalCount(_root: any, args: any, { models }: IContext) {
    const queryBuilder = getQueryBuilder('knowledgebase', models);
    const qry = await queryBuilder.buildArticleQuery(args);

    return models.KnowledgeBaseArticles.find(qry).countDocuments();
  }

  /**
   * Category list
   */
  async knowledgeBaseCategories(_root: any, args: any, { models }: IContext) {
    const queryBuilder = getQueryBuilder('knowledgebase', models);
    const qry = queryBuilder.buildQuery(args);

    return this.getListWithTranslations(
      models.KnowledgeBaseCategories,
      qry,
      args,
      FIELD_MAPPINGS.KNOWLEDGE_BASE_CATEGORY
    );
  }

  /**
   * Category detail
   */
  async knowledgeBaseCategoryDetail(
    _root: any,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    return this.getItemWithTranslation(
      models.KnowledgeBaseCategories,
      { _id },
      language,
      FIELD_MAPPINGS.KNOWLEDGE_BASE_CATEGORY
    );
  }

  /**
   * Category total count
   */
  async knowledgeBaseCategoriesTotalCount(
    _root: any,
    args: { topicIds: string[]; codes: string[] },
    { models }: IContext,
  ) {
    const queryBuilder = getQueryBuilder('knowledgebase', models);
    const qry = queryBuilder.buildQuery(args);

    return models.KnowledgeBaseCategories.find(qry).countDocuments();
  }

  /**
   * Get last category
   */
  async knowledgeBaseCategoriesGetLast(
    _root: any,
    _args: any,
    { commonQuerySelector, models }: IContext,
  ) {
    return models.KnowledgeBaseCategories.findOne(commonQuerySelector).sort({
      createdDate: -1,
    });
  }

  /**
   * Topic list
   */
  async knowledgeBaseTopics(_root: any, params: any, { models }: IContext) {
    const queryBuilder = getQueryBuilder('knowledgebase', models);
    const query = queryBuilder.buildQuery(params);

    return this.getListWithTranslations(
      models.KnowledgeBaseTopics,
      query,
      params,
      FIELD_MAPPINGS.KNOWLEDGE_BASE_TOPIC
    );
  }

  /**
   * Topic detail
   */
  async knowledgeBaseTopicDetail(
    _root: any,
    { _id, language }: { _id: string; language: string },
    { models }: IContext,
  ) {
    return this.getItemWithTranslation(
      models.KnowledgeBaseTopics,
      { _id },
      language,
      FIELD_MAPPINGS.KNOWLEDGE_BASE_TOPIC
    );
  }

  /**
   * Total topic count
   */
  async knowledgeBaseTopicsTotalCount(
    _root: any,
    _args: any,
    { commonQuerySelector, models }: IContext,
  ) {
    return models.KnowledgeBaseTopics.find(
      commonQuerySelector,
    ).countDocuments();
  }
}

const resolver = new KnowledgeBaseQueryResolver({} as IContext);
const knowledgeBaseQueries: any = {
  knowledgeBaseArticles: resolver.knowledgeBaseArticles.bind(resolver),
  knowledgeBaseArticleDetail: resolver.knowledgeBaseArticleDetail.bind(resolver),
  knowledgeBaseArticleDetailAndIncViewCount: resolver.knowledgeBaseArticleDetailAndIncViewCount.bind(resolver),
  knowledgeBaseArticlesTotalCount: resolver.knowledgeBaseArticlesTotalCount.bind(resolver),
  knowledgeBaseCategories: resolver.knowledgeBaseCategories.bind(resolver),
  knowledgeBaseCategoryDetail: resolver.knowledgeBaseCategoryDetail.bind(resolver),
  knowledgeBaseCategoriesTotalCount: resolver.knowledgeBaseCategoriesTotalCount.bind(resolver),
  knowledgeBaseCategoriesGetLast: resolver.knowledgeBaseCategoriesGetLast.bind(resolver),
  knowledgeBaseTopics: resolver.knowledgeBaseTopics.bind(resolver),
  knowledgeBaseTopicDetail: resolver.knowledgeBaseTopicDetail.bind(resolver),
  knowledgeBaseTopicsTotalCount: resolver.knowledgeBaseTopicsTotalCount.bind(resolver),
};

PermissionManager.applyKnowledgeBaseQueryPermissions(knowledgeBaseQueries);

export default knowledgeBaseQueries;
