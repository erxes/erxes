import { Companies, Segments } from '../../../db/models';
import QueryBuilder from '../../../segmentQueryBuilder';
import { CUSTOMER_CONTENT_TYPES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

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

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args
   * @param {CompanyListParams} args.params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { params }) {
    if (params.ids) {
      return paginate(Companies.find({ _id: { $in: params.ids } }), params);
    }

    const selector = await listQuery(params);

    return paginate(Companies.find(selector), params);
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
    const segments = await Segments.find({
      contentType: CUSTOMER_CONTENT_TYPES.COMPANY,
    });

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
};

moduleRequireLogin(companyQueries);

export default companyQueries;
