/* eslint-disable new-cap */

import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Integrations } from '/imports/api/integrations/integrations';
import { Channels } from '/imports/api/channels/channels';

import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';


export default class ListQueryBuilder {
  constructor(params, user = null) {
    this.params = params;
    this.user = user;
  }

  checkParams() {
    check(this.params, {
      channelId: Match.Optional(String),
      status: Match.Optional(String),
      assignedUserId: Match.Optional(String),
      unassigned: Match.Optional(String),
      brandId: Match.Optional(String),
      tagId: Match.Optional(String),
      participatedUserId: Match.Optional(String),
      starred: Match.Optional(String),
    });
  }

  // filter by channel
  channelFilter(channelId) {
    const channelFilter = {
      memberIds: this.user._id,
    };

    // filter by channel
    if (channelId) {
      channelFilter._id = channelId;
    }

    // find all posssible integrations
    this.totalIntegrationIds = [];

    Channels.find(channelFilter).forEach((channel) => {
      this.totalIntegrationIds = _.union(
        this.totalIntegrationIds,
        channel.integrationIds
      );
    });

    const query = { integrationId: { $in: this.totalIntegrationIds } };

    // default status filters are open and new
    _.extend(query, this.statusDefaultFilter());

    return query;
  }

  buildMain() {
    this.mainQuery = this.channelFilter(this.params.channelId);

    return this.mainQuery;
  }

  // filter all unassigned
  buildUnassigned() {
    this.unassignedQuery = {
      assignedUserId: { $exists: false },
    };

    return this.unassignedQuery;
  }

  // filter by starred
  buildStarred() {
    let ids = [];

    if (this.user && this.user.details) {
      ids = this.user.details.starredConversationIds || [];
    }

    this.starredQuery = {
      _id: { $in: ids },
    };

    return this.starredQuery;
  }

  statusFilter(statusChoices) {
    return {
      status: { $in: statusChoices },
    };
  }

  statusDefaultFilter() {
    return this.statusFilter([CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN]);
  }

  // filter by participated user
  participatedUserFilter(userId) {
    return {
      participatedUserIds: userId,
    };
  }

  // filter by tag
  tagFilter(tagId) {
    return {
      tagIds: tagId,
    };
  }

  // filter by brand
  brandFilter(brandId) {
    const integrations = Integrations.find({
      // id must be in integration ids that filtered in channelFilter
      _id: { $in: this.totalIntegrationIds },

      // filter by given brand
      brandId,
    });

    const integrationIds = _.pluck(integrations.fetch(), '_id');

    return {
      integrationId: { $in: integrationIds },
    };
  }

  mainFilter() {
    const query = this.mainQuery;

    // filter by starred
    if (this.params.starred) {
      _.extend(query, this.starredQuery);
    }

    // filter by status
    if (this.params.status) {
      _.extend(query, this.statusFilter([this.params.status]));
    }

    // filter by assigned user
    if (this.params.assignedUserId) {
      _.extend(query, { assignedUserId: this.params.assignedUserId });
    }

    // filter only unassigned
    if (this.params.unassigned) {
      _.extend(query, this.unassignedQuery);
    }

    // filter by tag
    if (this.params.tagId) {
      _.extend(query, this.tagFilter(this.params.tagId));
    }

    // filter by brand
    if (this.params.brandId) {
      _.extend(query, this.brandFilter(this.params.brandId));
    }

    // filter by participated user
    if (this.params.participatedUserId) {
      _.extend(
        query,
        this.participatedUserFilter(this.params.participatedUserId)
      );
    }

    return query;
  }
}
