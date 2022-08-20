import { fetchEs } from '@erxes/api-utils/src/elasticsearch';

import { debug } from './configs';
import { IModels } from './connectionResolver';
import { sendSegmentsMessage } from './messageBroker';

export interface ICountBy {
  [index: string]: number;
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
  qb: any
): Promise<ICountBy> => {
  // Count cocs by segments
  const counts: ICountBy = {};
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
  params: IListArgs
): Promise<ICountBy> => {
  const qb = new CommonBuilder(models, subdomain, params);

  return countBySegment(subdomain, qb);
};

export class CommonBuilder<IArgs extends IListArgs> {
  public models: IModels;
  public subdomain: string;
  public params: IArgs;

  public positiveList: any[];
  public filterList: any[];
  public activeIntegrationIds: string[] = [];

  constructor(models: IModels, subdomain: string, params: IArgs) {
    this.models = models;
    this.subdomain = subdomain;
    this.params = params;

    this.positiveList = [];
    this.filterList = [];
  }

  // filter by segment
  public async segmentFilter(segmentId: string) {
    const selector = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: 'fetchSegment',
      data: {
        segmentId,
        options: {
          returnSelector: true
        }
      },
      isRPC: true
    });

    this.positiveList = [...this.positiveList, selector];
  }

  public resetPositiveList() {
    this.positiveList = [];
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();

    // filter by segment
    if (this.params.segment) {
      await this.segmentFilter(this.params.segment);
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
