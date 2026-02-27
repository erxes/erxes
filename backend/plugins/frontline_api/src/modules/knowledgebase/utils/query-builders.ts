import { IModels } from '~/connectionResolvers';
import { escapeRegExp } from 'erxes-api-shared/utils';

export interface QueryBuilderArgs {
  searchValue?: string;
  status?: string;
  brandId?: string;
  icon?: string;
  ids?: string[];
  topicIds?: string[];
  categoryIds?: string[];
  articleIds?: string[];
  codes?: string[];
  clientPortalId?: string;
  [key: string]: any;
}

export class BaseQueryBuilder {
  protected models: IModels;

  constructor(models: IModels) {
    this.models = models;
  }

  protected addSearchQuery(
    query: any,
    searchValue: string,
    searchFields: string[],
  ): void {
    if (!searchValue?.trim()) return;

    const pattern = escapeRegExp(searchValue.trim());
    const regex = new RegExp(pattern, 'i');
    query.$or = searchFields.map((field) => ({ [field]: regex }));
  }

  protected addArrayFilter(query: any, field: string, values: string[]): void {
    if (values && values.length > 0) {
      query[field] = { $in: values };
    }
  }

  protected addFieldFilter(query: any, field: string, value: any): void {
    if (value !== undefined && value !== null) {
      query[field] = value;
    }
  }
}

export class ArticleQueryBuilder extends BaseQueryBuilder {
  async buildQuery(args: QueryBuilderArgs): Promise<any> {
    const query: any = {};

    const arrayFields = ['codes', 'categoryIds', 'articleIds'];
    arrayFields.forEach((field) => {
      if (args[field] && args[field].length > 0) {
        const queryField = field.replace('s', '');
        query[queryField] = { $in: args[field] };
      }
    });

    if (args.searchValue) {
      this.addSearchQuery(query, args.searchValue, [
        'title',
        'content',
        'summary',
      ]);
    }

    this.addFieldFilter(query, 'brandId', args.brandId);
    this.addFieldFilter(query, 'status', args.status);

    if (args.ids && args.ids.length > 0) {
      query._id = { $in: args.ids };
    }

    if (args.topicIds && args.topicIds.length > 0) {
      const categoryIdsFromTopics = await this.models.Category.find({
        topicId: { $in: args.topicIds },
      }).distinct('_id');

      if (categoryIdsFromTopics.length > 0) {

        if (query.categoryId?.$in) {
              const existingCategoryIds = query.categoryId.$in as string[];
              const narrowedCategoryIds = existingCategoryIds.filter((id) =>
                categoryIdsFromTopics.includes(id),
              );
              query.categoryId = { $in: narrowedCategoryIds };
            } else {
              query.categoryId = { $in: categoryIdsFromTopics };
            }
    
            if (!query.categoryId.$in.length) {
              query._id = { $in: [] };
                    }
      } else {

        if (!query.categoryId) {
          query._id = { $in: [] };
        }
      }
    }

    return query;
  }
}

export class CategoryQueryBuilder extends BaseQueryBuilder {
  buildQuery(args: QueryBuilderArgs): any {
    const query: any = {};

    const arrayFields = ['codes', 'topicIds'];
    arrayFields.forEach((field) => {
      if (args[field] && args[field].length > 0) {
        const queryField = field.replace('s', '');
        query[queryField] = { $in: args[field] };
      }
    });

    if (args.searchValue) {
      this.addSearchQuery(query, args.searchValue, ['title']);
    }

    this.addFieldFilter(query, 'icon', args.icon);

    if (args.ids && args.ids.length > 0) {
      query._id = { $in: args.ids };
    }

    return query;
  }
}

export class TopicQueryBuilder extends BaseQueryBuilder {
  buildQuery(args: QueryBuilderArgs): any {
    const query: any = {};

    const arrayFields = ['codes'];
    arrayFields.forEach((field) => {
      if (args[field] && args[field].length > 0) {
        const queryField = field.replace('s', '');
        query[queryField] = { $in: args[field] };
      }
    });

    this.addFieldFilter(query, 'brandId', args.brandId);
    this.addFieldFilter(query, 'clientPortalId', args.clientPortalId);

    if (args.ids && args.ids.length > 0) {
      query._id = { $in: args.ids };
    }

    return query;
  }
}

export function getQueryBuilder(
  type: 'article' | 'category' | 'topic' | 'knowledgebase',
  models: IModels,
) {
  switch (type) {
    case 'article':
      return new ArticleQueryBuilder(models);
    case 'category':
      return new CategoryQueryBuilder(models);
    case 'topic':
      return new TopicQueryBuilder(models);
    case 'knowledgebase':
      return new ArticleQueryBuilder(models);
    default:
      throw new Error(`Unknown query builder type: ${type}`);
  }
}
