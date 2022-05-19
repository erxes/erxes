import * as _ from 'underscore';
import { fixDate } from '@erxes/api-utils/src';

import { debug } from './configs';
import { sendSegmentsMessage } from './messageBroker';
import { IModels } from './connectionResolver';
import { fetchEs } from '@erxes/api-utils/src/elasticsearch';

export interface ICountBy {
  [index: string]: number;
}

interface IUserArgs {
  _id: string;
  code?: string;
  starredConversationIds?: string[];
}

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
  segment?: string;
  startDate?: string;
  endDate?: string;
}

export const countBySegment = async (
  subdomain: string,
  qb: any,
  counts: ICountBy
): Promise<ICountBy> => {
  // Count cocs by segments
  let segments: any[] = [];

  segments = await sendSegmentsMessage({
    subdomain,
    action: 'find',
    data: {
      contentType: 'tumentech:car'
    },
    isRPC: true
  });

  // Count cocs by segment
  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s._id);
      counts[s._id] = await qb.runQueries();
    } catch (e) {
      debug.error(`Error during segment count ${e.message}`);
      counts[s._id] = 0;
    }
  }

  return counts;
};

export const countByCars = async (
  models: IModels,
  subdomain: string,
  params: IListArgs,
  categoryId: string,
  user: IUserArgs,
  only: string
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const qb = new CommonBuilder(models, subdomain, params, categoryId, user);

  switch (only) {
    case 'bySegment':
      await countBySegment(subdomain, qb, counts);
      break;
  }

  return counts;
};

export class CommonBuilder<IArgs extends IListArgs> {
  public models: IModels;
  public subdomain: string;
  public params: IArgs;
  public user: IUserArgs;
  public categoryId: string;
  public positiveList: any[];
  public filterList: any[];
  public activeIntegrationIds: string[] = [];

  constructor(
    models: IModels,
    subdomain: string,
    params: IArgs,
    categoryId: string,
    user: IUserArgs
  ) {
    this.models = models;
    this.subdomain = subdomain;
    this.params = params;
    this.user = user;
    this.categoryId = categoryId;

    this.positiveList = [];
    this.filterList = [];

    this.resetPositiveList();
    this.defaultFilters();
  }

  // filter by segment
  public async segmentFilter(segmentId: string) {
    const segment = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: 'findOne',
      data: {
        _id: segmentId
      },
      isRPC: true
    });

    const selector = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: 'fetchSegment',
      data: {
        segment,
        returnSelector: true
      },
      isRPC: true
    });

    this.positiveList = [...this.positiveList, selector];
  }

  public resetPositiveList() {
    const userRelevanceQuery = [
      {
        regexp: {
          userRelevance: `${this.user.code}..`
        }
      },
      {
        bool: {
          must_not: [
            {
              exists: {
                field: 'userRelevance'
              }
            }
          ]
        }
      }
    ];

    this.positiveList = [{ bool: { should: userRelevanceQuery } }];
  }

  public async defaultFilters(): Promise<any> {
    this.filterList = [
      {
        terms: {
          'categoryId.keyword': this.categoryId
        }
      }
    ];
  }

  public categoryNotFound() {
    this.filterList.push({
      match: {
        categoryId: 'categoryNotFound'
      }
    });
  }

  public async dateFilter(startDate: string, endDate: string) {
    this.positiveList.push(
      {
        range: {
          createdAt: {
            gte: fixDate(startDate),
            lte: fixDate(endDate)
          }
        }
      },
      {
        range: {
          updatedAt: {
            gte: fixDate(startDate),
            lte: fixDate(endDate)
          }
        }
      }
    );
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();

    await this.defaultFilters();

    // filter by segment
    if (this.params.segment) {
      await this.segmentFilter(this.params.segment);
    }

    if (this.params.startDate && this.params.endDate) {
      await this.dateFilter(this.params.startDate, this.params.endDate);
    }
  }

  /*
   * Run queries
   */
  public async runQueries(): Promise<any> {
    const queryOptions: any = {
      query: {
        bool: {
          must: this.positiveList,
          filter: this.filterList
        }
      }
    };

    const response = await fetchEs({
      subdomain: this.subdomain,
      action: 'count',
      index: 'cars',
      body: queryOptions,
      defaultValue: 0
    });

    return response.count;
  }
}
