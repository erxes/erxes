/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Integrations } from '../integrations';


Meteor.publish('integrations.list', (params) => {
  check(params, {
    brandIds: Match.Optional([String]),
    kind: Match.Optional(String),
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

  return Integrations.find(selector, { fields: Integrations.publicFields });
});


Meteor.publish('integrations.getById', function integrationsGetById(id) {
  check(id, String);

  if (! this.userId) {
    return this.ready();
  }

  return Integrations.find({ _id: id }, { fields: Integrations.publicFields });
});
