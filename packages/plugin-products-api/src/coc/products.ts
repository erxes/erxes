import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { CommonBuilder } from './utils';

type TSortBuilder = { primaryName: number } | { [index: string]: number };

export const sortBuilder = (params: IListArgs): TSortBuilder => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  let sortParams: TSortBuilder = { primaryName: -1 };

  if (sortField) {
    sortParams = { [sortField]: sortDirection };
  }

  return sortParams;
};

export interface IListArgs {
  type?: string;
  categoryId?: string;
  tag?: string;
  searchValue?: string;
  perPage?: number;
  page?: number;
  sortField?: number;
  sortDirection?: number;
  ids?: string[];
  autoCompletion: string;
  autoCompletionType: string;
  excludeIds?: boolean;
  pipelineId?: string;
  boardId?: string;
  segment?: string;
  segmentData?: string;
}

export class Builder extends CommonBuilder<IListArgs> {
  constructor(models: IModels, subdomain: string, params: IListArgs, context) {
    super(models, subdomain, 'products', params, context);
  }

  public async findAllMongo(limit: number) {
    const selector = {
      ...this.context.commonQuerySelector,
      status: { $ne: 'deleted' }
    };

    const products = await this.models.Products.find(selector)
      .sort({ createdAt: -1 })
      .limit(limit);

    const count = await this.models.Products.find(selector).countDocuments();

    return {
      list: products,
      totalCount: count
    };
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    await super.buildAllQueries();
  }
}
