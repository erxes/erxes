import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';

import { ErxesMixin } from '/imports/api/utils';
import { Integrations } from '../integrations';
import { KIND_CHOICES } from '../constants';
import { twitter } from './social_api/oauth';
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
      name: String,
      appId: String,
      brandId: String,
      pageIds: [String],
    });
  },

  run({ name, appId, brandId, pageIds }) {
    return Integrations.insert({
      name,
      kind: KIND_CHOICES.FACEBOOK,
      brandId,
      facebookData: {
        appId,
        pageIds,
      },
    });
  },
});

// get facebook apps's list from settings.json
export const getFacebookAppList = new ValidatedMethod({
  name: 'integrations.getFacebookAppList',
  mixins: [ErxesMixin],

  validate() {},

  run() {
    return _.map(Meteor.settings.FACEBOOK_APPS, (app) => ({
      id: app.ID,
      name: app.NAME,
    }));
  },
});

// get facebook apps's page list from settings.json
export const getFacebookPageList = new ValidatedMethod({
  name: 'integrations.getFacebookPageList',
  mixins: [ErxesMixin],

  validate({ appId }) {
    check(appId, String);
  },

  run({ appId }) {
    const app = _.find(Meteor.settings.FACEBOOK_APPS, (a) => a.ID === appId);

    if (!app) {
      return [];
    }

    const response = getPageList(app.ACCESS_TOKEN);

    if (response.status === 'ok') {
      return response.pages;
    }

    return [];
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
