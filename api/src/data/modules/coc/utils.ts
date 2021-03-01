import * as _ from 'underscore';
import { Brands, Conformities, Segments, Tags } from '../../../db/models';
import { companySchema } from '../../../db/models/definitions/companies';
import { KIND_CHOICES } from '../../../db/models/definitions/constants';
import { customerSchema } from '../../../db/models/definitions/customers';
import { ISegmentDocument } from '../../../db/models/definitions/segments';
import { debugBase } from '../../../debuggers';
import { fetchElk } from '../../../elasticsearch';
import { COC_LEAD_STATUS_TYPES } from '../../constants';
import { fetchBySegments } from '../segments/queryBuilder';

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
  contentType: string,
  qb,
  source?: string
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count cocs by segments
  let segments: ISegmentDocument[] = [];

  // show all contact related engages when engage
  if (source === 'engages') {
    segments = await Segments.find({
      contentType: ['customer', 'lead', 'visitor']
    });
  } else {
    segments = await Segments.find({ contentType });
  }

  // Count cocs by segment
  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s._id);
      counts[s._id] = await qb.runQueries('count');
    } catch (e) {
      debugBase(`Error during segment count ${e.message}`);
      counts[s._id] = 0;
    }
  }

  return counts;
};

export const countByBrand = async (qb): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by brand
  const brands = await Brands.find({});

  for (const brand of brands) {
    await qb.buildAllQueries();
    await qb.brandFilter(brand._id);

    counts[brand._id] = await qb.runQueries('count');
  }

  return counts;
};

export const countByTag = async (type: string, qb): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by tag
  const tags = await Tags.find({ type }).select('_id');

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
  conformityIsRelated?: boolean;
  conformityIsSaved?: boolean;
  source?: string;
}

export class CommonBuilder<IListArgs extends ICommonListArgs> {
  public params: IListArgs;
  public context;
  public positiveList: any[];
  public negativeList: any[];

  private contentType: 'customers' | 'companies';

  constructor(
    contentType: 'customers' | 'companies',
    params: IListArgs,
    context
  ) {
    this.contentType = contentType;
    this.context = context;
    this.params = params;

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
  public async segmentFilter(segmentId: string) {
    const segment = await Segments.getSegment(segmentId);

    const { positiveList, negativeList } = await fetchBySegments(
      segment,
      'count'
    );

    this.positiveList = [...this.positiveList, ...positiveList];
    this.negativeList = [...this.negativeList, ...negativeList];
  }

  // filter by tagId
  public tagFilter(tagId: string) {
    this.positiveList.push({
      terms: {
        tagIds: [tagId]
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

  public async conformityFilter() {
    const {
      conformityMainType,
      conformityMainTypeId,
      conformityIsRelated,
      conformityIsSaved
    } = this.params;

    if (!conformityMainType && !conformityMainTypeId) {
      return;
    }

    const relType = this.contentType === 'customers' ? 'customer' : 'company';

    if (conformityIsRelated) {
      const relTypeIds = await Conformities.relatedConformity({
        mainType: conformityMainType || '',
        mainTypeId: conformityMainTypeId || '',
        relType
      });

      this.positiveList.push({
        terms: {
          _id: relTypeIds || []
        }
      });
    }

    if (conformityIsSaved) {
      const relTypeIds = await Conformities.savedConformity({
        mainType: conformityMainType || '',
        mainTypeId: conformityMainTypeId || '',
        relTypes: [relType]
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
      await this.segmentFilter(this.params.segment);
    }

    // filter by tag
    if (this.params.tag) {
      this.tagFilter(this.params.tag);
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

    if (action === 'search') {
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

    const response = await fetchElk(action, this.contentType, queryOptions);

    if (action === 'count') {
      return response.count;
    }

    const list = response.hits.hits.map(hit => {
      return {
        _id: hit._id,
        ...hit._source
      };
    });

    return {
      list,
      totalCount: response.hits.total.value
    };
  }
}
