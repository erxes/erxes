/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */

import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Integrations } from '/imports/api/integrations/integrations';
import { Channels } from '/imports/api/channels/channels';

import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';


export default class ListQueryBuilder {
  constructor(params, user = null) {
    this.params = params;
    this.user = user;

    // prepare all queries. do not do any action
    this.buildAllQueries();
  }

  checkParams() {
    check(this.params, {
      channelId: Match.Optional(String),
      status: Match.Optional(String),
      unassigned: Match.Optional(String),
      brandId: Match.Optional(String),
      tagId: Match.Optional(String),
      participating: Match.Optional(String),
      starred: Match.Optional(String),
    });
  }

  defaultFilters() {
    return {
      ...this.integrationsFilter(),

      ...this.statusFilter(
        [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN],
      ),
    };
  }

  /*
   * @queries: [
   *  {integrationId: {$in: ['id1', 'id2']}},
   *  {integrationId: {$in: ['id3', 'id1', 'id4']}
   * ]
   */
  intersectIntegrationIds(...queries) {
    // filter only queries with $in field
    const with$in = _.filter(queries, q =>
      q.integrationId && q.integrationId.$in && q.integrationId.$in.length > 0,
    );

    // [{$in: ['id1', 'id2']}, {$in: ['id3', 'id1', 'id4']}]
    const $ins = _.pluck(with$in, 'integrationId');

    // [['id1', 'id2'], ['id3', 'id1', 'id4']]
    const nestedIntegrationIds = _.pluck($ins, '$in');

    // ['id1']
    const integrationids = _.intersection(...nestedIntegrationIds);

    return {
      integrationId: { $in: integrationids },
    };
  }

  integrationsFilter() {
    const channelFilter = {
      memberIds: this.user._id,
    };

    // find all posssible integrations
    let availIntegrationIds = [];

    Channels.find(channelFilter).forEach((channel) => {
      availIntegrationIds = _.union(availIntegrationIds, channel.integrationIds);
    });

    const nestedIntegrationIds = [{ integrationId: { $in: availIntegrationIds } }];

    // filter by channel
    if (this.params.channelId) {
      const channelQuery = this.channelFilter(this.params.channelId);
      nestedIntegrationIds.push(channelQuery);
    }

    // filter by brand
    if (this.params.brandId) {
      const brandQuery = this.brandFilter(this.params.brandId);
      nestedIntegrationIds.push(brandQuery);
    }

    return this.intersectIntegrationIds(...nestedIntegrationIds);
  }

  // filter by channel
  channelFilter(channelId) {
    const channel = Channels.findOne(channelId);

    return {
      integrationId: { $in: channel.integrationIds },
    };
  }

  // filter by brand
  brandFilter(brandId) {
    const integrations = Integrations.find({ brandId });

    const integrationIds = _.pluck(integrations.fetch(), '_id');

    return {
      integrationId: { $in: integrationIds },
    };
  }

  // filter all unassigned
  unassignedFilter() {
    this.unassignedQuery = {
      assignedUserId: { $exists: false },
    };

    return this.unassignedQuery;
  }

  // filter by participating
  participatingFilter() {
    return {
      participatedUserIds: this.user._id,
    };
  }

  // filter by starred
  starredFilter() {
    let ids = [];

    if (this.user && this.user.details) {
      ids = this.user.details.starredConversationIds || [];
    }

    return {
      _id: { $in: ids },
    };
  }

  statusFilter(statusChoices) {
    return {
      status: { $in: statusChoices },
    };
  }

  // filter by tag
  tagFilter(tagId) {
    return {
      tagIds: tagId,
    };
  }

  /*
   * prepare all queries. do not do any action
   */
  buildAllQueries() {
    const queries = {
      default: this.defaultFilters(),
      starred: {},
      status: {},
      unassigned: {},
      tag: {},
      channel: {},
      integrations: {},
      participating: {},
    };

    // filter by channel
    if (this.params.channelId) {
      queries.channel = this.channelFilter(this.params.channelId);
    }

    // filter by channelId & brandId
    queries.integrations = this.integrationsFilter();

    // unassigned
    if (this.params.unassigned) {
      queries.unassigned = this.unassignedFilter();
    }

    // participating
    if (this.params.participating) {
      queries.participating = this.participatingFilter();
    }

    // starred
    if (this.params.starred) {
      queries.starred = this.starredFilter();
    }

    // filter by status
    if (this.params.status) {
      queries.status = this.statusFilter([this.params.status]);
    }

    // filter by tag
    if (this.params.tagId) {
      queries.tag = this.tagFilter(this.params.tagId);
    }

    this.queries = queries;
  }

  mainQuery() {
    return {
      ...this.queries.default,
      ...this.queries.integrations,
      ...this.queries.unassigned,
      ...this.queries.participating,
      ...this.queries.status,
      ...this.queries.starred,
      ...this.queries.tag,
    };
  }
}
