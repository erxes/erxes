import {
  fetchEs,
  generateElkIds,
  getRealIdFromElk,
} from '@erxes/api-utils/src/elasticsearch';

import { generateModels, IModels } from '../../../connectionResolver';
import { COC_LEAD_STATUS_TYPES } from './constants';
import { sendInboxMessage } from '../../../messageBroker';

import { debugError } from '@erxes/api-utils/src/debuggers';
import { companySchema } from '../../../db/models/definitions/companies';
import { customerSchema } from '../../../db/models/definitions/customers';
import { fetchSegment } from '../segments/queryBuilder';

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

  const models = await generateModels(subdomain);

  // Count cocs by segments
  let segments: any[] = [];

  // show all contact related engages when engage
  if (source === 'engages') {
    segments = await models.Segments.find({
      name: { $exists: true },
      contentType: 'core:lead',
    });
  } else {
    segments = await models.Segments.find({
      contentType,
      name: { $exists: true },
    });
  }

  // Count cocs by segment
  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s, source);
      counts[s._id] = await qb.runQueries('count');
    } catch (e) {
      debugError(`Error during segment count ${e.message}`);
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
  const models = await generateModels(subdomain);

  // Count customers by brand

  const brands = await models.Brands.find({});

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

  const models = await generateModels(subdomain);

  // Count customers by tag

  const tags = await models.Tags.find({ type });

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

export const countByIntegrationType = async (
  subdomain: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const kindsMap = await sendInboxMessage({
    subdomain,
    data: {},
    action: 'getIntegrationKinds',
    isRPC: true,
    defaultValue: {},
  });

  for (const type of Object.keys(kindsMap)) {
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
  tags?: string[];
  excludeTags?: string[];
  tagWithRelated?: boolean;
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
  segmentData?: any;
  emailValidationStatus?: string;
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
  public async segmentFilter(segment: any, source?: string, segmentData?: any) {
    const isSegmentEmpty = !Object.keys(segment).length;
    const isContentTypeContact = ['lead', 'customer', 'company'].some(type =>
      (segment?.contentType || '').includes(type)
    );

    const isSourceEngages = source === 'engages';

    if (isSegmentEmpty && segmentData) {
      segment = segmentData;
    }

    let options: any = { returnSelector: true };

    if (isSourceEngages && isContentTypeContact) {
      options = {
        returnAssociated: {
          mainType: segment.contentType,
          relType: `core:${this.getRelType()}`,
        },
        returnSelector: true,
      };
    }

    const selector = await fetchSegment(
      this.models,
      this.subdomain,
      segment,
      options
    );

    this.positiveList = [...this.positiveList, selector];
  }

  // filter by tagId
  public async tagFilter(tagId: string, withRelated?: boolean) {
    let tagIds: string[] = [tagId];

    if (withRelated) {
      const tag = await this.models.Tags.getTag(tagId);

      tagIds = [tagId, ...(tag?.relatedIds || [])];
    }

    this.positiveList.push({
      terms: {
        tagIds,
      },
    });
  }

  // filter by tagId
  public async tagsFilter(
    tags: string[],
    isExclude: boolean,
    withRelated?: boolean
  ) {
    let tagIds: string[] = tags;

    if (withRelated) {
      const tagObjs = await this.models.Tags.find({ _id: { $in: tagIds } });
      tagObjs.forEach(tag => {
        tagIds = tagIds.concat(tag.relatedIds || []);
      });
    }

    if (isExclude) {
      this.negativeList.push({
        terms: { tagIds },
      });
    } else {
      this.positiveList.push({
        terms: { tagIds },
      });
    }
  }

  // filter by search value
  public searchFilter(value: string): void {
    if (value.includes('@')) {
      this.positiveList.push({
        match_phrase: {
          searchText: {
            query: value,
          },
        },
      });
    } else {
      this.positiveList.push({
        bool: {
          should: [
            {
              match: {
                searchText: {
                  query: value,
                },
              },
            },
            {
              wildcard: {
                searchText: `*${value.toLowerCase()}*`,
              },
            },
          ],
        },
      });
    }
  }

  // filter by auto-completion type
  public searchByAutoCompletionType(value: string, type: string): void {
    this.positiveList.push({
      wildcard: {
        [type]: `*${(value || '').toLowerCase()}*`,
      },
    });
  }

  // filter by id
  public async idsFilter(ids: string[]): Promise<void> {
    if (this.params.excludeIds) {
      this.negativeList.push({
        terms: { _id: await generateElkIds(ids, this.subdomain) },
      });
    } else {
      this.positiveList.push({
        terms: { _id: await generateElkIds(ids, this.subdomain) },
      });
    }
  }

  // filter by leadStatus
  public leadStatusFilter(leadStatus: string): void {
    this.positiveList.push({
      term: {
        leadStatus,
      },
    });
  }

  public emailValidateFilter(emailValidationStatus: string): void {
    this.positiveList.push({
      term: {
        emailValidationStatus,
      },
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
      conformityIsSaved,
    } = this.params;

    if (!conformityMainType && !conformityMainTypeId) {
      return;
    }

    const relType = conformityRelType ? conformityRelType : this.getRelType();

    if (conformityIsRelated) {
      const relTypeIds = await this.models.Conformities.relatedConformity({
        mainType: conformityMainType || '',
        mainTypeId: conformityMainTypeId || '',
        relType,
      });

      this.positiveList.push({
        terms: {
          _id: await generateElkIds(relTypeIds || [], this.subdomain),
        },
      });
    }

    if (conformityIsSaved) {
      const relTypeIds = await this.models.Conformities.savedConformity({
        mainType: conformityMainType || '',
        mainTypeId: conformityMainTypeId || '',
        relTypes: [relType],
      });

      this.positiveList.push({
        terms: {
          _id: await generateElkIds(relTypeIds || [], this.subdomain),
        },
      });
    }
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();
    this.resetNegativeList();

    // filter by segment data
    if (this.params.segmentData) {
      const segment = JSON.parse(this.params.segmentData);

      await this.segmentFilter({}, '', segment);
    }

    // filter by segment
    if (this.params.segment) {
      const segment = await this.models.Segments.getSegment(
        this.params.segment
      );

      await this.segmentFilter(segment);
    }

    // filter by tag
    if (this.params.tag) {
      await this.tagFilter(this.params.tag, true);
    }

    if (this.params.tags) {
      await this.tagsFilter(
        this.params.tags,
        false,
        this.params.tagWithRelated
      );
    }

    if (this.params.excludeTags) {
      await this.tagsFilter(
        this.params.excludeTags,
        true,
        this.params.tagWithRelated
      );
    }

    // filter by leadStatus
    if (this.params.leadStatus) {
      this.leadStatusFilter(this.params.leadStatus);
    }

    if (this.params.emailValidationStatus) {
      this.emailValidateFilter(this.params.emailValidationStatus);
    }

    // If there are ids and form params, returning ids filter only filter by ids
    if (this.params.ids && this.params.ids.length > 0) {
      if (typeof this.params.ids === 'string') {
        this.params.ids = [this.params.ids];
      }
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
      totalCount: 0,
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
      searchValue,
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
          must_not: this.negativeList,
        },
      },
    };

    let totalCount = 0;

    if (action === 'search') {
      const totalCountResponse = await fetchEs({
        subdomain: this.subdomain,
        action: 'count',
        index: this.contentType,
        body: queryOptions,
        defaultValue: 0,
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
              : 'desc',
          },
        };
      }
    }

    const response = await fetchEs({
      subdomain: this.subdomain,
      action,
      index: this.contentType,
      body: queryOptions,
    });

    if (action === 'count') {
      return response && response.count ? response.count : 0;
    }

    const list = response.hits.hits.map(hit => {
      return {
        _id: getRealIdFromElk(hit._id),
        ...hit._source,
      };
    });

    return {
      list,
      totalCount,
    };
  }
}
