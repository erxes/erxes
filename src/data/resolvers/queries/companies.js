import { Companies, Segments } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';
import { COC_CONTENT_TYPES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

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
      { name: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { website: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { industry: new RegExp(`.*${params.searchValue}.*`, 'i') },
      { plan: new RegExp(`.*${params.searchValue}.*`, 'i') },
    ];

    selector = { $or: fields };
  }

  return selector;
};

const companyQueries = {
  /**
   * Companies list
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { ids, ...params }) {
    if (params.ids) {
      return paginate(Companies.find({ _id: { $in: ids } }), params);
    }

    let selector = await listQuery(params);

    return paginate(Companies.find(selector), params);
  },

  /**
   * Group company counts by segments
   * @param {Object} args - Query params
   * @return {Object} counts map
   */
  async companyCounts(root, args) {
    const counts = {
      bySegment: {},
      byBrand: {},
      byIntegrationType: {},
      byTag: {},
    };
    const selector = await listQuery(args);

    const count = query => {
      const findQuery = Object.assign({}, selector, query);
      return Companies.find(findQuery).count();
    };

    // Count current filtered companies
    counts.all = await count(selector);

    // Count companies by segments
    const segments = await Segments.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
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
