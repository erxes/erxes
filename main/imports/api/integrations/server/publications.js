/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Integrations } from '../integrations';


Meteor.publish('integrations.list', (params) => {
  check(params, {
    brandIds: Match.Optional([String]),
  });

  const selector = {};

  // filter by brand
  if (params.brandIds) {
    selector.brandId = { $in: params.brandIds };
  }

  return Integrations.find(selector, { fields: Integrations.publicFields });
});
