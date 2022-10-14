import { fetchEs } from '@erxes/api-utils/src/elasticsearch';

import { debug } from '../configs';
import { IModels } from '../connectionResolver';
import {
  fetchSegment,
  sendCoreMessage,
  sendSegmentsMessage,
  sendTagsMessage
} from '../messageBroker';
import { productSchema } from '../models/definitions/products';

export interface ICountBy {
  [index: string]: number;
}

export const getEsTypes = (contentType: string) => {
  const schema = productSchema;

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

  let segments: any[] = [];

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

export const countByTag = async (
  subdomain: string,
  type: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

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

interface ICommonListArgs {
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

export class CommonBuilder<IListArgs extends ICommonListArgs> {
  public params: IListArgs;
  public context;
  public positiveList: any[];
  public negativeList: any[];
  public models: IModels;
  public subdomain: string;

  private contentType: 'products';

  constructor(
    models: IModels,
    subdomain: string,
    contentType: 'products',
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
  public async segmentFilter(segment: any, source?: string, segmentData?: any) {
    const selector = await fetchSegment(
      this.subdomain,
      segment._id,
      source === 'engages' && !segment.contentType.includes('products')
        ? {
            returnAssociated: {
              mainType: segment.contentType,
              relType: `products:${this.getRelType()}`
            },
            returnSelector: true
          }
        : { returnSelector: true },
      segmentData
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

  // filter by categoryId
  public async categoryIdFilter(categoryId: string): Promise<void> {
    const category = await this.models.ProductCategories.getProductCatogery({
      _id: categoryId,
      status: { $in: [null, 'active'] }
    });

    const product_category_ids = await this.models.ProductCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    );

    this.positiveList.push({
      terms: { categoryId: { $in: product_category_ids } }
    });
  }

  public async excludeCategoryIdFilter(): Promise<void> {
    const notActiveCategories = await this.models.ProductCategories.find({
      status: { $nin: [null, 'active'] }
    });

    this.negativeList.push({ $in: notActiveCategories.map(e => e._id) });
  }

  // filter by type
  public async typeFilter(type: string): Promise<void> {
    this.positiveList.push({ terms: { type: type } });
  }

  public getRelType() {
    return this.contentType === 'products' ? 'product' : '';
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();
    this.resetNegativeList();

    if (this.params.type) {
      await this.typeFilter(this.params.type);
    }

    if (this.params.categoryId) {
      await this.categoryIdFilter(this.params.categoryId);
    }

    if (!this.params.categoryId) {
      await this.excludeCategoryIdFilter();
    }

    // filter by segment data
    if (this.params.segmentData) {
      const segment = JSON.parse(this.params.segmentData);

      await this.segmentFilter({}, '', segment);
    }

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
