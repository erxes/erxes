import { Channels, Brands, Conversations, Tags } from '../../../db/models';
import { INTEGRATION_KIND_CHOICES } from '../../constants';
import QueryBuilder from './conversationQueryBuilder';

export default {
  /**
   * Conversataions list
   * @param {Object} args
   * @param {ConversationListParams} args.params
   * @return {Promise} filtered conversations list by given parameters
   */
  async conversations(root, { params }, { user }) {
    // filter by ids of conversations
    if (params && params.ids) {
      return Conversations.find({ _id: { $in: params.ids } }).sort({ createdAt: -1 });
    }

    // initiate query builder
    const qb = new QueryBuilder(params, { _id: user._id });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery())
      .sort({ createdAt: -1 })
      .limit(params.limit);
  },

  /**
   * Group conversation counts by brands, channels, integrations, status
   *
   * @param {Object} args
   * @param {Object} context
   * @param {ConversationListParams} args.params
   * @param {Object} context.user
   *
   * @return {Object} counts map
   */
  async conversationCounts(root, { params }, { user }) {
    const response = {
      byChannels: {},
      byIntegrationTypes: {},
      byBrands: {},
      byTags: {},
    };

    const qb = new QueryBuilder(params, { _id: user._id });

    await qb.buildAllQueries();

    const queries = qb.queries;

    // count helper
    const count = async query => await Conversations.find(query).count();

    // count by channels ==================
    const channels = await Channels.find();

    for (let channel of channels) {
      response.byChannels[channel._id] = await count(
        Object.assign({}, queries.default, await qb.channelFilter(channel._id)),
      );
    }

    // count by brands ==================
    const brands = await Brands.find();

    for (let brand of brands) {
      response.byBrands[brand._id] = await count(
        Object.assign(
          {},
          queries.default,
          qb.intersectIntegrationIds(queries.channel, await qb.brandFilter(brand._id)),
        ),
      );
    }

    // unassigned count
    response.unassigned = await count(
      Object.assign(
        {},
        queries.default,
        queries.integrations,
        queries.integrationType,
        qb.unassignedFilter(),
      ),
    );

    // participating count
    response.participating = await count(
      Object.assign(
        {},
        queries.default,
        queries.integrations,
        queries.integrationType,
        qb.participatingFilter(),
      ),
    );

    // starred count
    response.starred = await count(
      Object.assign(
        {},
        queries.default,
        queries.integrations,
        queries.integrationType,
        qb.starredFilter(),
      ),
    );

    // resolved count
    response.resolved = await count(
      Object.assign(
        {},
        queries.default,
        queries.integrations,
        queries.integrationType,
        qb.statusFilter(['closed']),
      ),
    );

    // by integration type
    for (let intT of INTEGRATION_KIND_CHOICES.ALL_LIST) {
      response.byIntegrationTypes[intT] = await count(
        Object.assign({}, queries.default, await qb.integrationTypeFilter(intT)),
      );
    }

    // by tag
    const tags = await Tags.find();

    for (let tag of tags) {
      response.byTags[tag._id] = await count(
        Object.assign(
          {},
          queries.default,
          queries.integrations,
          queries.integrationType,
          qb.tagFilter(tag._id),
        ),
      );
    }

    return response;
  },

  /**
   * Get one conversation
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found conversation
   */
  conversationDetail(root, { _id }) {
    return Conversations.findOne({ _id });
  },

  /**
   * Get all conversations count. We will use it in pager
   * @return {Promise} total count
   */
  async conversationsTotalCount(root, { params }, { user }) {
    // initiate query builder
    const qb = new QueryBuilder(params, { _id: user._id });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery()).count();
  },
};
