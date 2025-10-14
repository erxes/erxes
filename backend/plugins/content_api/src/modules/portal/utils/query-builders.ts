import { IModels } from '~/connectionResolvers';
import { escapeRegExp } from 'erxes-api-shared/src/utils';

export interface QueryBuilderArgs {
  searchValue?: string;
  status?: string;
  clientPortalId?: string;
  categoryIds?: string[];
  tagIds?: string[];
  authorId?: string;
  featured?: boolean;
  type?: string;
  brandId?: string;
  icon?: string;
  ids?: string[];
  topicIds?: string[];
  articleIds?: string[];
  codes?: string[];
  [key: string]: any;
}

export class BaseQueryBuilder {
  protected models: IModels;

  constructor(models: IModels) {
    this.models = models;
  }

  /**
   * Add search functionality to query
   */
  protected addSearchQuery(query: any, searchValue: string, searchFields: string[]): void {
    if (!searchValue?.trim()) return;

    const pattern = escapeRegExp(searchValue.trim());
    const regex = new RegExp(pattern, 'i');
    query.$or = searchFields.map(field => ({ [field]: regex }));
  }

  /**
   * Add array field filter to query
   */
  protected addArrayFilter(query: any, field: string, values: string[]): void {
    if (values && values.length > 0) {
      query[field] = { $in: values };
    }
  }

  /**
   * Add simple field filter to query
   */
  protected addFieldFilter(query: any, field: string, value: any): void {
    if (value !== undefined && value !== null) {
      query[field] = value;
    }
  }
}

export class PostQueryBuilder extends BaseQueryBuilder {
  async buildQuery(args: QueryBuilderArgs): Promise<any> {
    const query: any = {
      clientPortalId: args.clientPortalId,
    };

    // Add search functionality
    if (args.searchValue) {
      this.addSearchQuery(query, args.searchValue, [
        'title',
        'slug',
        'content',
        'excerpt'
      ]);
    }

    // Add filters
    this.addFieldFilter(query, 'status', args.status);
    this.addFieldFilter(query, 'authorId', args.authorId);
    this.addFieldFilter(query, 'featured', args.featured);
    this.addArrayFilter(query, 'categoryIds', args.categoryIds || []);
    this.addArrayFilter(query, 'tagIds', args.tagIds || []);

    // Handle post type
    if (args.type === 'post') {
      query.type = 'post';
    } else if (args.type && args.type !== 'post') {
      const customType = await this.models.CustomPostTypes.findOne({
        clientPortalId: args.clientPortalId,
        code: args.type,
      }).lean();

      if (customType) {
        query.type = customType._id;
      } else {
        query.type = 'post';
      }
    }

    return query;
  }
}

export class CategoryQueryBuilder extends BaseQueryBuilder {
  buildQuery(args: QueryBuilderArgs): any {
    const query: any = {
      clientPortalId: args.clientPortalId,
    };

    // Add search functionality
    if (args.searchValue) {
      this.addSearchQuery(query, args.searchValue, ['name', 'slug']);
    }

    // Add filters
    this.addFieldFilter(query, 'status', args.status);

    return query;
  }
}

export class PageQueryBuilder extends BaseQueryBuilder {
  buildQuery(args: QueryBuilderArgs): any {
    const query: any = {
      clientPortalId: args.clientPortalId,
    };

    // Add search functionality
    if (args.searchValue) {
      this.addSearchQuery(query, args.searchValue, ['name', 'slug']);
    }

    return query;
  }
}

export class KnowledgeBaseQueryBuilder extends BaseQueryBuilder {
  buildQuery(args: QueryBuilderArgs): any {
    const query: any = {};

    // Handle array filters
    const arrayFields = ['codes', 'categoryIds', 'articleIds', 'topicIds'];
    arrayFields.forEach(field => {
      if (args[field] && args[field].length > 0) {
        const queryField = field.replace('s', '');
        query[queryField] = { $in: args[field] };
      }
    });

    // Add search functionality
    if (args.searchValue) {
      this.addSearchQuery(query, args.searchValue, [
        'title',
        'content',
        'summary'
      ]);
    }

    // Add simple filters
    this.addFieldFilter(query, 'brandId', args.brandId);
    this.addFieldFilter(query, 'icon', args.icon);
    this.addFieldFilter(query, 'status', args.status);

    if (args.ids && args.ids.length > 0) {
      query._id = { $in: args.ids };
    }

    return query;
  }

  /**
   * Build query for articles with topic filtering
   */
  async buildArticleQuery(args: QueryBuilderArgs): Promise<any> {
    const query = this.buildQuery(args);

    // Handle topic filtering for articles
    if (args.topicIds && args.topicIds.length > 0) {
      const categoryIds = await this.models.KnowledgeBaseCategories.find({
        topicId: { $in: args.topicIds },
      }).distinct('_id');

      query.categoryId = { $in: categoryIds };
      delete query.topicId;
    }

    return query;
  }
}

/**
 * Factory function to get appropriate query builder
 */
export function getQueryBuilder(type: 'post' | 'category' | 'page' | 'knowledgebase', models: IModels) {
  switch (type) {
    case 'post':
      return new PostQueryBuilder(models);
    case 'category':
      return new CategoryQueryBuilder(models);
    case 'page':
      return new PageQueryBuilder(models);
    case 'knowledgebase':
      return new KnowledgeBaseQueryBuilder(models);
    default:
      throw new Error(`Unknown query builder type: ${type}`);
  }
}
