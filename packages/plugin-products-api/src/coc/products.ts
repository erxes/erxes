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
  dateFilters?: any;
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

  // filter by date fields & properties
  public async dateFilters(filters: string): Promise<void> {
    const dateFilters = JSON.parse(filters);

    const operators = ['gte', 'lte'];

    for (const key of Object.keys(dateFilters)) {
      if (key.includes('customFieldsData')) {
        const field = key.split('.')[1];

        const nestedQry: any = {
          nested: {
            path: 'customFieldsData',
            query: {
              bool: {
                must: [
                  {
                    term: {
                      'customFieldsData.field': field
                    }
                  }
                ]
              }
            }
          }
        };

        for (const operator of operators) {
          const value = new Date(dateFilters[key][operator]);

          const rangeQry: any = {
            range: { 'customFieldsData.dateValue': {} }
          };

          rangeQry.range['customFieldsData.dateValue'][operator] = value;

          nestedQry.nested.query.bool.must.push(rangeQry);

          this.positiveList.push(nestedQry);
        }
      } else {
        for (const operator of operators) {
          const value = new Date(dateFilters[key][operator]);

          const qry: any = {
            range: { [key]: {} }
          };

          qry.range[key][operator] = value;

          if (value) {
            this.positiveList.push(qry);
          }
        }
      }
    }
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    await super.buildAllQueries();

    if (this.params.dateFilters) {
      await this.dateFilters(this.params.dateFilters);
    }
  }
}
