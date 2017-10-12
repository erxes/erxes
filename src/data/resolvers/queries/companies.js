import { Companies, Segments } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder.js';

const listQuery = async params => {
  const selector = {};

  // Filter by segments
  if (params.segment) {
    const segment = await Segments.findOne({ _id: params.segment });
    const query = QueryBuilder.segments(segment);
    Object.assign(selector, query);
  }

  return selector;
};

export default {
  /**
   * Companies list
   * @param {Object} args
   * @param {CompanyListParams} args.params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { params }) {
    if (params.ids) {
      return Companies.find({ _id: { $in: params.ids } });
    }

    const selector = await listQuery(params);

    return Companies.find(selector).limit(params.limit || 0);
  },

  /**
   * Group company counts by segments
   * @param {Object} args
   * @param {CompanyListParams} args.params
   * @return {Object} counts map
   */
  async companyCounts(root, { params }) {
    const counts = { bySegment: {}, byBrand: {}, byIntegrationType: {}, byTag: {} };
    const selector = await listQuery(params);

    const count = query => {
      const findQuery = Object.assign({}, selector, query);
      return Companies.find(findQuery).count();
    };

    // Count current filtered companies
    counts.all = await count(selector);

    // Count companies by segments
    const segments = await Segments.find();

    for (let s of segments) {
      counts.bySegment[s._id] = await count(QueryBuilder.segments(s));
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
   * Get all companies count. We will use it in pager
   * @return {Promise} total count
   */
  companiesTotalCount() {
    return Companies.find({}).count();
  },
};
