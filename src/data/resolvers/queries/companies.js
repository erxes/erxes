import { Companies, Segments } from '../../../db/models';
import QueryBuilder from './segmentQueryBuilder';
import { COC_CONTENT_TYPES } from '../../constants';
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
   * @param {Object} args - Query params
   * @return {Promise} filtered companies list by given parameters
   */
  async companies(root, { ids, searchValue, ...params }) {
    if (params.ids) {
      return paginate(Companies.find({ _id: { $in: ids } }), params);
    }

    if (searchValue) {
      const fields = [
        { name: new RegExp(`.*${searchValue}.*`, 'i') },
        { website: new RegExp(`.*${searchValue}.*`, 'i') },
        { industry: new RegExp(`.*${searchValue}.*`, 'i') },
        { plan: new RegExp(`.*${searchValue}.*`, 'i') },
      ];

      if (!isNaN(searchValue)) {
        fields.push = { size: new RegExp(`.*${searchValue}.*`, 'i') };
      }

      return paginate(
        Companies.find({
          $or: fields,
        }),
        params,
      );
    }

    const selector = await listQuery(params);

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
