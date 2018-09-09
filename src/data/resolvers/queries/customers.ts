import { Brands, Customers, Forms, Segments, Tags } from '../../../db/models';
import { ISegment } from '../../../db/models/definitions/segments';
import {
  COC_CONTENT_TYPES,
  COC_LEAD_STATUS_TYPES,
  COC_LIFECYCLE_STATE_TYPES,
  INTEGRATION_KIND_CHOICES,
  TAG_TYPES,
} from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { cocsExport } from './cocExport';
import BuildQuery, { IListArgs } from './customerQueryBuilder';
import QueryBuilder from './segmentQueryBuilder';
import { paginate } from './utils';

interface ISortParams {
  [index: string]: number;
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
    const totalCount = await Customers.find(qb.mainQuery()).count();

    return { list, totalCount };
  },

  /**
   * Group customer counts by brands, segments, integrations, tags
   */
  async customerCounts(_root, params: IListArgs) {
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

    const count = query => {
      const findQuery = { $and: [mainQuery, query] };

      return Customers.find(findQuery).count();
    };

    // Count customers by segments
    const segments = await Segments.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
    });

    // Count customers by segment
    for (const s of segments) {
      counts.bySegment[s._id] = await count(await qb.segmentFilter(s._id));
    }

    // Count customers by fake segment
    if (params.byFakeSegment) {
      counts.byFakeSegment = await count(QueryBuilder.segments(params.byFakeSegment));
    }

    // Count customers by brand
    const brands = await Brands.find({});

    for (const brand of brands) {
      counts.byBrand[brand._id] = await count(await qb.brandFilter(brand._id));
    }

    // Count customers by integration kind
    for (const kind of INTEGRATION_KIND_CHOICES.ALL) {
      counts.byIntegrationType[kind] = await count(await qb.integrationTypeFilter(kind));
    }

    // Count customers by tag
    const tags = await Tags.find({ type: TAG_TYPES.CUSTOMER });

    for (const tag of tags) {
      counts.byTag[tag._id] = await count(qb.tagFilter(tag._id));
    }

    // Count customers by submitted form
    const forms = await Forms.find({});

    for (const form of forms) {
      counts.byForm[form._id] = await count(await qb.formFilter(form._id, params.startDate, params.endDate));
    }

    // Count customers by lead status
    for (const status of COC_LEAD_STATUS_TYPES) {
      counts.byLeadStatus[status] = await count(qb.leadStatusFilter(status));
    }

    // Count customers by life cycle state
    for (const state of COC_LIFECYCLE_STATE_TYPES) {
      counts.byLifecycleState[state] = await count(qb.lifecycleStateFilter(state));
    }

    return counts;
  },

  /**
   * Publishes customers list for the preview
   * when creating/editing a customer segment
   */
  async customerListForSegmentPreview(_root, { segment, limit }: { segment: ISegment; limit: number }) {
    const headSegment = await Segments.findOne({ _id: segment.subOf });

    const query = QueryBuilder.segments(segment, headSegment);
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

export default customerQueries;
