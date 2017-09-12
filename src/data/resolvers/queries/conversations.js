import { Channels, Brands, Conversations, Tags } from '../../../db/models';
import { INTEGRATION_KIND_CHOICES } from '../../constants';
import QueryBuilder from './conversationQueryBuilder';

export default {
  async conversations(root, { params }) {
    // filter by ids of conversations
    if (params && params.ids) {
      return Conversations.find({ _id: { $in: params.ids } }).sort({ createdAt: -1 });
    }

    // initiate query builder
    const qb = new QueryBuilder(params, { _id: 'uTaHtqQMptvhspvAK' });

    await qb.buildAllQueries();

    return Conversations.find(qb.mainQuery()).sort({ createdAt: -1 });
  },

  async conversationCounts(root, { params }) {
    const response = {
      byChannels: {},
      byIntegrationTypes: {},
      byBrands: {},
      byTags: {},
    };

    const qb = new QueryBuilder(params, { _id: 'uTaHtqQMptvhspvAK' });

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

  conversationDetail(root, { _id }) {
    return Conversations.findOne({ _id });
  },

  totalConversationsCount() {
    return Conversations.find({}).count();
  },
};
