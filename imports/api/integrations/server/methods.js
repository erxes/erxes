import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/underscore';
import { ErxesMixin } from '/imports/api/utils';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/conversations/messages';
import { Customers } from '/imports/api/customers/customers';
import { Channels } from '/imports/api/channels/channels';
import { Integrations } from '../integrations';
import { KIND_CHOICES } from '../constants';
import twitter from './social_api/twitter';
import { getPageList } from './social_api/facebook';


// add in app messaging
export const addInAppMessaging = new ValidatedMethod({
  name: 'integrations.addInAppMessaging',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { name: String, brandId: String });
  },

  run({ doc }) {
    return Integrations.insert(
      _.extend(doc, { kind: KIND_CHOICES.IN_APP_MESSAGING }),
    );
  },
});

// edit in app messaging
export const editInAppMessaging = new ValidatedMethod({
  name: 'integrations.editInAppMessaging',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { name: String, brandId: String });
  },

  run({ _id, doc }) {
    return Integrations.update({ _id }, { $set: doc });
  },
});


// add chat
export const addChat = new ValidatedMethod({
  name: 'integrations.addChat',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { name: String, brandId: String });
  },

  run({ doc }) {
    return Integrations.insert(
      _.extend(doc, { kind: KIND_CHOICES.CHAT }),
    );
  },
});

// edit chat
export const editChat = new ValidatedMethod({
  name: 'integrations.editChat',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { name: String, brandId: String });
  },

  run({ _id, doc }) {
    return Integrations.update({ _id }, { $set: doc });
  },
});

// add twitter
export const addTwitter = new ValidatedMethod({
  name: 'integrations.addTwitter',
  mixins: [ErxesMixin],

  validate(doc) {
    check(doc, { brandId: String, queryParams: Object });
  },

  run({ brandId, queryParams }) {
    // authenticate via twitter and get logged in user's infos
    twitter.authenticate(queryParams, (doc) => {
      const id = Integrations.insert(
        _.extend(doc, { brandId, kind: KIND_CHOICES.TWITTER }),
      );

      // start tracking newly created twitter integration
      const integration = Integrations.findOne({ _id: id });
      twitter.trackIntegration(integration);
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
    return _.map(Meteor.settings.FACEBOOK_APPS, app => ({
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
    const app = _.find(Meteor.settings.FACEBOOK_APPS, a => a.ID === appId);

    if (!app) {
      return [];
    }

    return getPageList(app.ACCESS_TOKEN);
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
    // check whether or not used in channels
    if (Channels.find({ integrationIds: { $in: [id] } }).count() > 0) {
      throw new Meteor.Error(
        'integrations.remove.usedInChannel',
        'Used in channel',
      );
    }

    // conversations
    const conversations = Conversations.find({ integrationId: id }).fetch();
    const conversationIds = _.pluck(conversations, '_id');

    // remove messages
    Messages.remove({ conversationId: { $in: conversationIds } });

    // remove conversations
    Conversations.remove({ integrationId: id });

    // remove customers
    Customers.remove({ integrationId: id });

    return Integrations.remove(id);
  },
});
