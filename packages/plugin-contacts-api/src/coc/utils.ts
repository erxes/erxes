import { fetchEs } from '@erxes/api-utils/src/elasticsearch';

import { debug } from '../configs';
import { IModels } from '../connectionResolver';
import { COC_LEAD_STATUS_TYPES } from '../constants';
import {
  fetchSegment,
  sendCoreMessage,
  sendSegmentsMessage,
  sendTagsMessage
} from '../messageBroker';
import { companySchema } from '../models/definitions/companies';
import { KIND_CHOICES } from '../models/definitions/constants';
import { customerSchema } from '../models/definitions/customers';

export interface ICountBy {
  [index: string]: number;
}

export const getEsTypes = (contentType: string) => {
  const schema = ['company', 'companies'].includes(contentType)
    ? companySchema
    : customerSchema;

  const typesMap: { [key: string]: any } = {};

  schema.eachPath(name => {
    const path = schema.paths[name];
    typesMap[name] = path.options.esType;
  });

  return typesMap;
};

export const countBySegment = async (
  subdomain: string,
  contentType: string,
  qb,
  source?: string
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count cocs by segments
  let segments: any[] = [];

  // show all contact related engages when engage
  if (source === 'engages') {
    segments = await sendSegmentsMessage({
      subdomain,
      action: 'find',
      data: { name: { $exists: true } },
      isRPC: true,
      defaultValue: []
    });
  } else {
    segments = await sendSegmentsMessage({
      subdomain,
      action: 'find',
      data: { contentType, name: { $exists: true } },
      isRPC: true,
      defaultValue: []
    });
  }

  // Count cocs by segment
  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s, source);
      counts[s._id] = await qb.runQueries('count');
    } catch (e) {
      debug.error(`Error during segment count ${e.message}`);
      counts[s._id] = 0;
    }
  }

  return counts;
};

export const countByBrand = async (
  subdomain: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by brand
  const brands = await sendCoreMessage({
    subdomain,
    action: 'brands.find',
    data: {
      query: {}
    },
    isRPC: true,
    defaultValue: []
  });

  for (const brand of brands) {
    await qb.buildAllQueries();
    await qb.brandFilter(brand._id);

    counts[brand._id] = await qb.runQueries('count');
  }

  return counts;
};

export const countByTag = async (
  subdomain: string,
  type: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by tag
  const tags = await sendTagsMessage({
    subdomain,
    action: 'find',
    data: { type },
    isRPC: true,
    defaultValue: []
  });

  for (const tag of tags) {
    await qb.buildAllQueries();
    await qb.tagFilter(tag._id);

    counts[tag._id] = await qb.runQueries('count');
  }

  return counts;
};

export const countByLeadStatus = async (qb): Promise<ICountBy> => {
  const counts: ICountBy = {};

  for (const type of COC_LEAD_STATUS_TYPES) {
    await qb.buildAllQueries();

    qb.leadStatusFilter(type);

    counts[type] = await qb.runQueries('count');
  }

  return counts;
};

export const countByIntegrationType = async (qb): Promise<ICountBy> => {
  const counts: ICountBy = {};

  for (const type of KIND_CHOICES.ALL) {
    await qb.buildAllQueries();
    await qb.integrationTypeFilter(type);

    counts[type] = await qb.runQueries('count');
  }

  return counts;
};

interface ICommonListArgs {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  segment?: string;
  tag?: string;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  autoCompletion?: boolean;
  autoCompletionType?: string;
  brand?: string;
  leadStatus?: string;
  conformityMainType?: string;
  conformityMainTypeId?: string;
  conformityRelType?: string;
  conformityIsRelated?: boolean;
  conformityIsSaved?: boolean;
  source?: string;
}

export class CommonBuilder<IListArgs extends ICommonListArgs> {
  public params: IListArgs;
  public context;
  public positiveList: any[];
  public negativeList: any[];
  public models: IModels;
  public subdomain: string;

  private contentType: 'customers' | 'companies';

  constructor(
    models: IModels,
    subdomain: string,
    contentType: 'customers' | 'companies',
    params: IListArgs,
    context
  ) {
    this.contentType = contentType;
    this.context = context;
    this.params = params;
    this.models = models;
    this.subdomain = subdomain;

    this.positiveList = [];
    this.negativeList = [];

    this.resetPositiveList();
    this.resetNegativeList();
  }

  public resetNegativeList() {
    this.negativeList = [{ term: { status: 'deleted' } }];
  }

  public resetPositiveList() {
    this.positiveList = [];

    if (this.context.commonQuerySelectorElk) {
      this.positiveList.push(this.context.commonQuerySelectorElk);
    }
  }

  // filter by segment
  public async segmentFilter(segment: any, source?: string) {
    const selector = await fetchSegment(
      this.subdomain,
      segment._id,
      source === 'engages'
        ? {
            returnAssociated: {
              mainType: segment.contentType,
              relType: `contacts:${this.getRelType()}`
            },
            returnSelector: true
          }
        : { returnSelector: true }
    );

    this.positiveList = [...this.positiveList, selector];
  }

  // filter by tagId
  public async tagFilter(tagId: string, withRelated?: boolean) {
    let tagIds: string[] = [tagId];

    if (withRelated) {
      const tag = await sendTagsMessage({
        subdomain: this.subdomain,
        action: 'find',
        data: { _id: tagId }
      });

      tagIds = [tagId, ...(tag?.relatedIds || [])];
    }

    this.positiveList.push({
      terms: {
        tagIds
      }
    });
  }

  // filter by search value
  public searchFilter(value: string): void {
    if (value.includes('@')) {
      this.positiveList.push({
        match_phrase: {
          searchText: {
            query: value
          }
        }
      });
    } else {
      this.positiveList.push({
        bool: {
          should: [
            {
              match: {
                searchText: {
                  query: value
                }
              }
            },
            {
              wildcard: {
                searchText: `*${value.toLowerCase()}*`
              }
            }
          ]
        }
      });
    }
  }

  // filter by auto-completion type
  public searchByAutoCompletionType(value: string, type: string): void {
    this.positiveList.push({
      wildcard: {
        [type]: `*${(value || '').toLowerCase()}*`
      }
    });
  }

  // filter by id
  public idsFilter(ids: string[]): void {
    if (this.params.excludeIds) {
      this.negativeList.push({ terms: { _id: ids } });
    } else {
      this.positiveList.push({ terms: { _id: ids } });
    }
  }

  // filter by leadStatus
  public leadStatusFilter(leadStatus: string): void {
    this.positiveList.push({
      term: {
        leadStatus
      }
    });
  }

  public getRelType() {
    return this.contentType === 'customers' ? 'customer' : 'company';
  }

  public async conformityFilter() {
    const {
      conformityMainType,
      conformityMainTypeId,
      conformityIsRelated,
      conformityRelType,
      conformityIsSaved
    } = this.params;

    if (!conformityMainType && !conformityMainTypeId) {
      return;
    }

    const relType = conformityRelType ? conformityRelType : this.getRelType();

    if (conformityIsRelated) {
      const relTypeIds = await sendCoreMessage({
        subdomain: this.subdomain,
        action: 'conformities.relatedConformity',
        data: {
          mainType: conformityMainType || '',
          mainTypeId: conformityMainTypeId || '',
          relType
        },
        isRPC: true,
        defaultValue: []
      });

      this.positiveList.push({
        terms: {
          _id: relTypeIds || []
        }
      });
    }

    if (conformityIsSaved) {
      const relTypeIds = await sendCoreMessage({
        subdomain: this.subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: conformityMainType || '',
          mainTypeId: conformityMainTypeId || '',
          relTypes: [relType]
        },
        isRPC: true,
        defaultValue: []
      });

      this.positiveList.push({
        terms: {
          _id: relTypeIds || []
        }
      });
    }
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();
    this.resetNegativeList();

    // filter by segment
    if (this.params.segment) {
      const segment = await sendSegmentsMessage({
        isRPC: true,
        action: 'findOne',
        subdomain: this.subdomain,
        data: { _id: this.params.segment }
      });

      await this.segmentFilter(segment);
    }

    // filter by tag
    if (this.params.tag) {
      await this.tagFilter(this.params.tag, true);
    }

    // filter by leadStatus
    if (this.params.leadStatus) {
      this.leadStatusFilter(this.params.leadStatus);
    }

    // If there are ids and form params, returning ids filter only filter by ids
    if (this.params.ids && this.params.ids.length > 0) {
      this.idsFilter(this.params.ids.filter(id => id));
    }

    // filter by search value
    if (this.params.searchValue) {
      this.params.autoCompletion
        ? this.searchByAutoCompletionType(
            this.params.searchValue,
            this.params.autoCompletionType || ''
          )
        : this.searchFilter(this.params.searchValue);
    }

    await this.conformityFilter();
  }

  public async findAllMongo(_limit: number): Promise<any> {
    return Promise.resolve({
      list: [],
      totalCount: 0
    });
  }

  /*
   * Run queries
   */
  public async runQueries(
    action = 'search',
    unlimited?: boolean
  ): Promise<any> {
    const {
      page = 0,
      perPage = 0,
      sortField,
      sortDirection,
      searchValue
    } = this.params;
    const paramKeys = Object.keys(this.params).join(',');

    const _page = Number(page || 1);
    let _limit = Number(perPage || 20);

    if (unlimited) {
      _limit = 10000;
    }

    if (
      !unlimited &&
      page === 1 &&
      perPage === 20 &&
      (paramKeys === 'page,perPage' || paramKeys === 'page,perPage,type')
    ) {
      return this.findAllMongo(_limit);
    }

    const queryOptions: any = {
      query: {
        bool: {
          must: this.positiveList,
          must_not: this.negativeList
        }
      }
    };

    let totalCount = 0;

    if (action === 'search') {
      const totalCountResponse = await fetchEs({
        subdomain: this.subdomain,
        action: 'count',
        index: this.contentType,
        body: queryOptions,
        defaultValue: 0
      });

      totalCount = totalCountResponse.count;

      queryOptions.from = (_page - 1) * _limit;
      queryOptions.size = _limit;

      const esTypes = getEsTypes(this.contentType);

      let fieldToSort = sortField || 'createdAt';

      if (!esTypes[fieldToSort] || esTypes[fieldToSort] === 'email') {
        fieldToSort = `${fieldToSort}.keyword`;
      }

      if (!searchValue) {
        queryOptions.sort = {
          [fieldToSort]: {
            order: sortDirection
              ? sortDirection === -1
                ? 'desc'
                : 'asc'
              : 'desc'
          }
        };
      }
    }

    const response = await fetchEs({
      subdomain: this.subdomain,
      action,
      index: this.contentType,
      body: queryOptions
    });

    if (action === 'count') {
      return response && response.count ? response.count : 0;
    }

    const list = response.hits.hits.map(hit => {
      return {
        _id: hit._id,
        ...hit._source
      };
    });

    return {
      list,
      totalCount
    };
  }
}
