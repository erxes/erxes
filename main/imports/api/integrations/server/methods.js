import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';

import { ErxesMixin } from '/imports/api/utils';
import { Integrations } from '../integrations';
import { KIND_CHOICES } from '../constants';
import { twitter } from './social_api/oauth';

// add in app messaging
export const addInAppMessaging = new ValidatedMethod({
  name: 'integrations.addInAppMessaging',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, {
      name: String,
      brandId: String,
    });
  },

  run({ doc }) {
    return Integrations.insert(
      _.extend(doc, { kind: KIND_CHOICES.IN_APP_MESSAGING })
    );
  },
});

// add twitter
export const addTwitter = new ValidatedMethod({
  name: 'integrations.addTwitter',
  mixins: [ErxesMixin],

  validate(doc) {
    check(doc, {
      brandId: String,
      queryParams: Object,
    });
  },

  run({ brandId, queryParams }) {
    // authenticate via twitter and get logged in user's infos
    twitter.authenticate(queryParams, (doc) => {
      Integrations.insert(
        _.extend(doc, { brandId, kind: KIND_CHOICES.TWITTER })
      );
    });
  },
});

// integration remove
export const remove = new ValidatedMethod({
  name: 'integrations.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return Integrations.remove(id);
  },
});
