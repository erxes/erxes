import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';

import { ErxesMixin } from '/imports/api/utils';
import { Integrations } from '../integrations';
import { KIND_CHOICES } from '../constants';
import { twitter, facebook } from './social_api/oauth';
import { trackTwitterIntegration } from './social_api/twitter';
import { getPageList } from './social_api/facebook';


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
      const id = Integrations.insert(
        _.extend(doc, { brandId, kind: KIND_CHOICES.TWITTER })
      );

      // start tracking newly created twitter integration
      const integration = Integrations.findOne({ _id: id });
      trackTwitterIntegration(integration);
    });
  },
});

// add facebook
export const addFacebook = new ValidatedMethod({
  name: 'integrations.addFacebook',
  mixins: [ErxesMixin],

  validate(doc) {
    check(doc, {
      brandId: String,
      queryParams: Object,
    });
  },

  run({ brandId, queryParams }) {
    // authenticate via facebook and get logged in user's infos
    facebook.authenticate(queryParams, (_doc) => {
      const doc = {
        ..._doc,
        brandId,
        kind: KIND_CHOICES.FACEBOOK,
      };

      // get list of pages
      const response = getPageList(doc.facebookData.accessToken);

      // access token session expired or some other error
      if (response.status === 'error') {
        throw new Meteor.Error(response.message);
      }

      doc.facebookData.pages = response.pages;

      // create new integration
      Integrations.insert(doc);

      // start tracking newly created facebook integration
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
