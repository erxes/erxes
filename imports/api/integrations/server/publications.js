/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Integrations } from '../integrations';


Meteor.publish('integrations.list', function integrationList(params) {
  check(params, {
    brandIds: Match.Optional([String]),
    kind: Match.Optional(String),
    limit: Match.Optional(Number),
  });

  const selector = {};

  // filter by brand
  if (params.brandIds) {
    selector.brandId = { $in: params.brandIds };
  }

  // filter by kind
  if (params.kind) {
    selector.kind = params.kind;
  }

  Counts.publish(
    this,
    'integrations.list.count',
    Integrations.find(selector, {}),
    { noReady: true },
  );

  return Integrations.find(
    selector,
    {
      fields: Integrations.publicFields,
      sort: { createdAt: -1 },
      limit: params.limit,
    },
  );
});


Meteor.publish('integrations.getById', function integrationsGetById(id) {
  check(id, String);

  if (!this.userId) {
    return this.ready();
  }

  return Integrations.find({ _id: id }, { fields: Integrations.publicFields });
});
