import { Companies, Customers, Segments, Tags, Integrations, Brands } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';
import {
  TAG_TYPES,
  COC_CONTENT_TYPES,
  COC_LEAD_STATUS_TYPES,
  COC_LIFECYCLE_STATE_TYPES,
} from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';
import { cocsExport } from './cocExport';

/*
 * Brand filter
 */
const brandFilter = async brandId => {
  const integrations = await Integrations.find({ brandId }, { _id: 1 });
  const integrationIds = integrations.map(i => i._id);

  const customers = await Customers.find(
    { integrationId: { $in: integrationIds } },
    { companyIds: 1 },
  );

  let companyIds = [];

  for (const customer of customers) {
    companyIds = [...companyIds, ...(customer.companyIds || [])];
  }

  return { _id: { $in: companyIds } };
};

const listQuery = async params => {
  let selector = {};

  // Filter by segments
  if (params.segment) {
    const segment = await Segments.findOne({ _id: params.segment });
    const query = QueryBuilder.segments(segment);
    Object.assign(selector, query);
  }

  if (params.searchValue) {
    const fields = [
      { names: { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] } },
      { email: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { website: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { industry: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { plan: new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector = { $or: fields };
  }

  // Filter by tag
  if (params.tag) {
    selector.tagIds = params.tag;
  }

  // filter directly using ids
  if (params.ids) {
    selector = { _id: { $in: params.ids } };
  }

  // filter by lead status
  if (params.leadStatus) {
    selector.leadStatus = params.leadStatus;
  }

  // filter by life cycle state
  if (params.lifecycleState) {
    selector.lifecycleState = params.lifecycleState;
  }

  // filter by brandId
  if (params.brand) {
    selector = { ...selector, ...(await brandFilter(params.brand)) };
  }

  return selector;
};

const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection;

  let sortParams = { primaryName: -1 };

  if (sortField) {
    sortParams = { [sortField]: sortDirection };
  }

  return sortParams;
};

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, params) {
    const selector = await listQuery(params);

    const sort = sortBuilder(params);

    return paginate(Companies.find(selector), params).sort(sort);
  },

  /**
   * Companies for only main list
   * @param {Object} args
   * @return {Promise} filtered companies list by given parameters
   */
  async companiesMain(root, params) {
    const selector = await listQuery(params);
    const sort = sortBuilder(params);

    const list = await paginate(Companies.find(selector).sort(sort), params);
    const totalCount = await Companies.find(selector).count();

    return { list, totalCount };
  },

  /**
   * Group company counts by segments
   * @param {Object} args - Query params
   * @return {Object} counts map
   */
  async companyCounts(root, args) {
    const counts = {
      bySegment: {},
      byTag: {},
      byBrand: {},
      byLeadStatus: {},
      byLifecycleState: {},
    };

    const selector = await listQuery(args);

    const count = query => {
      const findQuery = Object.assign({}, selector, query);
      return Companies.find(findQuery).count();
    };

    // Count companies by segments =========
    const segments = await Segments.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
    });

    for (const s of segments) {
      counts.bySegment[s._id] = await count(QueryBuilder.segments(s));
    }

    // Count companies by tag =========
    const tags = await Tags.find({ type: TAG_TYPES.COMPANY });

    for (const tag of tags) {
      counts.byTag[tag._id] = await count({ tagIds: tag._id });
    }

    // Count companies by brand =========
    const brands = await Brands.find({});

    for (const brand of brands) {
      counts.byBrand[brand._id] = await count(await brandFilter(brand._id));
    }

    // Count companies by lead status ======
    for (const status of COC_LEAD_STATUS_TYPES) {
      counts.byLeadStatus[status] = await count({ leadStatus: status });
    }

    // Count companies by life cycle state =======
    for (const state of COC_LIFECYCLE_STATE_TYPES) {
      counts.byLifecycleState[state] = await count({ lifecycleState: state });
    }

    return counts;
  },

  /**
   * Get one company
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found company
   */
  companyDetail(root, { _id }) {
    return Companies.findOne({ _id });
  },

  /**
   * Export companies to xls file
   *
   * @param {Object} args - Query params
   * @return {String} File url
   */
  async companiesExport(root, params) {
    const selector = await listQuery(params);

    const sort = sortBuilder(params);

    const companies = await paginate(Companies.find(selector), params).sort(sort);

    return cocsExport(companies, 'company');
  },
};

moduleRequireLogin(companyQueries);

export default companyQueries;
