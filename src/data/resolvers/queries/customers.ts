import { Brands, Customers, Forms, Segments, Tags } from '../../../db/models';
import { ISegment } from '../../../db/models/definitions/segments';
import {
  ACTIVITY_CONTENT_TYPES,
  COC_LEAD_STATUS_TYPES,
  COC_LIFECYCLE_STATE_TYPES,
  INTEGRATION_KIND_CHOICES,
  TAG_TYPES,
} from '../../constants';
import { checkPermission, moduleRequireLogin } from '../../permissions';
import { cocsExport } from './cocExport';
import BuildQuery, { IListArgs } from './customerQueryBuilder';
import QueryBuilder from './segmentQueryBuilder';
import { paginate } from './utils';

interface ISortParams {
  [index: string]: number;
}

interface ICountBy {
  [index: string]: number;
}

interface ICountParams extends IListArgs {
  only: string;
}

const sortBuilder = (params: IListArgs): ISortParams => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  let sortParams: ISortParams = { 'messengerData.lastSeenAt': -1 };

  if (sortField) {
    sortParams = { [sortField]: sortDirection };
  }

  return sortParams;
};

const count = (query, mainQuery) => {
  const findQuery = { $and: [mainQuery, query] };

  return Customers.find(findQuery).countDocuments();
};

const countBySegment = async (qb: any, mainQuery: any): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by segments
  const segments = await Segments.find({
    contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
  });

  // Count customers by segment
  for (const s of segments) {
    try {
      counts[s._id] = await count(await qb.segmentFilter(s._id), mainQuery);
    } catch (e) {
      // catch mongo error
      if (e.name === 'CastError') {
        counts[s._id] = 0;
      } else {
        throw new Error(e);
      }
    }
  }

  return counts;
};

const countByBrand = async (qb: any, mainQuery: any): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by brand
  const brands = await Brands.find({});

  for (const brand of brands) {
    counts[brand._id] = await count(await qb.brandFilter(brand._id), mainQuery);
  }

  return counts;
};

const countByTag = async (qb: any, mainQuery: any): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by tag
  const tags = await Tags.find({ type: TAG_TYPES.CUSTOMER });

  for (const tag of tags) {
    counts[tag._id] = await count(qb.tagFilter(tag._id), mainQuery);
  }

  return counts;
};

const countByForm = async (qb: any, mainQuery: any, params: any): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by submitted form
  const forms = await Forms.find({});

  for (const form of forms) {
    counts[form._id] = await count(await qb.formFilter(form._id, params.startDate, params.endDate), mainQuery);
  }

  return counts;
};

const customerQueries = {
  /**
   * Customers list
   */
  async customers(_root, params: IListArgs) {
    const qb = new BuildQuery(params);

    await qb.buildAllQueries();

    const sort = sortBuilder(params);

    return paginate(Customers.find(qb.mainQuery()).sort(sort), params);
  },

  /**
   * Customers for only main list
   */
  async customersMain(_root, params: IListArgs) {
    const qb = new BuildQuery(params);

    await qb.buildAllQueries();

    const sort = sortBuilder(params);

    const list = await paginate(Customers.find(qb.mainQuery()).sort(sort), params);
    const totalCount = await Customers.find(qb.mainQuery()).countDocuments();

    return { list, totalCount };
  },

  /**
   * Group customer counts by brands, segments, integrations, tags
   */
  async customerCounts(_root, params: ICountParams) {
    const { only } = params;

    const counts = {
      bySegment: {},
      byBrand: {},
      byIntegrationType: {},
      byTag: {},
      byFakeSegment: 0,
      byForm: {},
      byLeadStatus: {},
      byLifecycleState: {},
    };

    const qb = new BuildQuery(params);

    await qb.buildAllQueries();

    let mainQuery = qb.mainQuery();

    // if passed at least one filter other than perPage
    // then find all filtered customers then add subsequent filter to it
    if (Object.keys(params).length > 1) {
      const customers = await Customers.find(qb.mainQuery(), { _id: 1 });
      const customerIds = customers.map(customer => customer._id);

      mainQuery = { _id: { $in: customerIds } };
    }

    switch (only) {
      case 'bySegment':
        counts.bySegment = await countBySegment(qb, mainQuery);
        break;

      case 'byBrand':
        counts.byBrand = await countByBrand(qb, mainQuery);
        break;

      case 'byTag':
        counts.byTag = await countByTag(qb, mainQuery);
        break;

      case 'byForm':
        counts.byForm = await countByForm(qb, mainQuery, params);
        break;
      case 'byLeadStatus':
        {
          for (const status of COC_LEAD_STATUS_TYPES) {
            counts.byLeadStatus[status] = await count(qb.leadStatusFilter(status), mainQuery);
          }
        }
        break;

      case 'byLifecycleState':
        {
          for (const state of COC_LIFECYCLE_STATE_TYPES) {
            counts.byLifecycleState[state] = await count(qb.lifecycleStateFilter(state), mainQuery);
          }
        }
        break;

      case 'byIntegrationType':
        {
          for (const kind of INTEGRATION_KIND_CHOICES.ALL) {
            counts.byIntegrationType[kind] = await count(await qb.integrationTypeFilter(kind), mainQuery);
          }
        }
        break;
    }

    // Count customers by fake segment
    if (params.byFakeSegment) {
      counts.byFakeSegment = await count(await QueryBuilder.segments(params.byFakeSegment), mainQuery);
    }

    return counts;
  },

  /**
   * Publishes customers list for the preview
   * when creating/editing a customer segment
   */
  async customerListForSegmentPreview(_root, { segment, limit }: { segment: ISegment; limit: number }) {
    const headSegment = await Segments.findOne({ _id: segment.subOf });

    const query = await QueryBuilder.segments(segment, headSegment);
    const sort = { 'messengerData.lastSeenAt': -1 };

    return Customers.find(query)
      .sort(sort)
      .limit(limit);
  },

  /**
   * Get one customer
   */
  customerDetail(_root, { _id }: { _id: string }) {
    return Customers.findOne({ _id });
  },

  /**
   * Export customers to xls file
   */
  async customersExport(_root, params: IListArgs) {
    const qb = new BuildQuery(params);

    await qb.buildAllQueries();

    const sort = sortBuilder(params);

    const customers = await Customers.find(qb.mainQuery()).sort(sort);

    return cocsExport(customers, 'customer');
  },
};

moduleRequireLogin(customerQueries);

checkPermission(customerQueries, 'customers', 'showCustomers', []);
checkPermission(customerQueries, 'customersMain', 'showCustomers', { list: [], totalCount: 0 });
checkPermission(customerQueries, 'customersExport', 'exportCustomers');

export default customerQueries;
