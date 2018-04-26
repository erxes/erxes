import { Brands, Tags, Integrations, Customers, Segments, Forms } from '../../../db/models';
import { TAG_TYPES, INTEGRATION_KIND_CHOICES, COC_CONTENT_TYPES } from '../../constants';
import QueryBuilder from './segmentQueryBuilder';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';
import { buildQuery } from './customerQueryBuilder';

const CUSTOMERS_SORT = { 'messengerData.lastSeenAt': -1 };

const customerQueries = {
  /**
   * Customers list
   * @param {Object} args
   * @return {Promise} filtered customers list by given parameters
   */
  async customers(root, params) {
    const selector = await buildQuery(params);

    return paginate(Customers.find(selector).sort(CUSTOMERS_SORT), params);
  },

  /**
   * Customers for only main list
   * @param {Object} args
   * @return {Promise} filtered customers list by given parameters
   */
  async customersMain(root, params) {
    const selector = await buildQuery(params);

    const list = await paginate(Customers.find(selector).sort(CUSTOMERS_SORT), params);
    const totalCount = await Customers.find(selector).count();

    return { list, totalCount };
  },

  /**
   * Group customer counts by brands, segments, integrations, tags
   * @param {Object} args
   * @param {CustomerListParams} args.params
   * @return {Object} counts map
   */
  async customerCounts(root, params) {
    const counts = {
      bySegment: {},
      byBrand: {},
      byIntegrationType: {},
      byTag: {},
      byFakeSegment: 0,
      byForm: {},
    };

    let selector = await buildQuery(params);

    const count = query => {
      const findQuery = Object.assign({}, selector, query);
      return Customers.find(findQuery).count();
    };

    // Count customers by segments
    const segments = await Segments.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
    });

    for (let s of segments) {
      counts.bySegment[s._id] = await count(QueryBuilder.segments(s));
    }

    // Count customers by fake segment
    if (params.byFakeSegment) {
      counts.byFakeSegment = await count(QueryBuilder.segments(params.byFakeSegment));
    }

    // Count customers by brand
    const brands = await Brands.find({});

    for (let brand of brands) {
      const integrations = await Integrations.find({ brandId: brand._id });

      counts.byBrand[brand._id] = await count({
        integrationId: { $in: integrations.map(i => i._id) },
      });
    }

    // Count customers by integration
    for (let kind of INTEGRATION_KIND_CHOICES.ALL) {
      const integrations = await Integrations.find({ kind });

      counts.byIntegrationType[kind] = await count({
        integrationId: { $in: integrations.map(i => i._id) },
      });
    }

    // Count customers by tag
    const tags = await Tags.find({ type: TAG_TYPES.CUSTOMER });

    for (let tag of tags) {
      counts.byTag[tag._id] = await count({ tagIds: tag._id });
    }

    // Count customers by submitted form
    const forms = await Forms.find({});

    for (let form of forms) {
      selector = await buildQuery({ ...params, form: form._id });

      counts.byForm[form._id] = await count(selector);
    }

    return counts;
  },

  /**
   * Publishes customers list for the preview
   * when creating/editing a customer segment
   * @param {Object} segment   Segment that's being created/edited
   * @param {Number} [limit=0] Customers limit (for pagination)
   */
  async customerListForSegmentPreview(root, { segment, limit }) {
    const headSegment = await Segments.findOne({ _id: segment.subOf });

    const query = QueryBuilder.segments(segment, headSegment);
    const sort = { 'messengerData.lastSeenAt': -1 };

    return Customers.find(query)
      .sort(sort)
      .limit(limit);
  },

  /**
   * Get one customer
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found customer
   */
  customerDetail(root, { _id }) {
    return Customers.findOne({ _id });
  },
};

moduleRequireLogin(customerQueries);

export default customerQueries;
