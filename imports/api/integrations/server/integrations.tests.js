/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import sinon from 'sinon';
import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';

import { Integrations } from '../integrations';
import { KIND_CHOICES } from '../constants';
import { addInAppMessaging, addChat, remove, addFacebook, addTwitter } from './methods';
import twitter from './social_api/twitter';


describe('integrations', function () {
  describe('methods', function () {
    let userId;
    let brandId;

    beforeEach(function () {
      Integrations.remove({});

      userId = Factory.create('user')._id;
      brandId = Factory.create('brand', { userId })._id;

      // unwrap the spy
      if (twitter.trackIntegration.restore) {
        twitter.trackIntegration.restore();
        twitter.authenticate.restore();
      }
    });

    it('add in app messsaging', function () {
      addInAppMessaging._execute(
        { userId },
        { doc: { name: 'Foo', brandId } },
      );

      const integration = Integrations.findOne({ name: 'Foo' });

      // check field values
      assert.equal(integration.kind, KIND_CHOICES.IN_APP_MESSAGING);
      assert.equal(integration.brandId, brandId);
    });

    it('add chat', function () {
      addChat._execute(
        { userId },
        { doc: { name: 'Foo', brandId } },
      );

      const integration = Integrations.findOne({ name: 'Foo' });

      // check field values
      assert.equal(integration.kind, KIND_CHOICES.CHAT);
      assert.equal(integration.brandId, brandId);
    });

    it('add facebook', function () {
      const appId = '24242424242';
      const pageIds = ['9934324242424242', '42424242424'];

      addFacebook._execute(
        { userId },
        {
          name: 'Facebook',
          brandId,
          appId,
          pageIds,
        },
      );

      const integration = Integrations.findOne({ name: 'Facebook' });

      // check field values
      assert.equal(integration.kind, KIND_CHOICES.FACEBOOK);
      assert.equal(integration.brandId, brandId);
      assert.equal(integration.facebookData.appId, appId);
      assert.deepEqual(integration.facebookData.pageIds, pageIds);
    });

    it('add twitter', function () {
      const twitterUserId = 24242424244242;

      // stub twitter authenticate
      sinon.stub(
        twitter,
        'authenticate',
        (queryString, callback) => {
          callback({
            name: 'Twitter',
            twitterData: {
              // authenticated user's twitter id,
              id: twitterUserId,
              token: 'access_token',
              tokenSecret: 'auth.token_secret',
            },
          });
        },
      );

      // stub track twitter integration
      sinon.stub(twitter, 'trackIntegration', () => {});

      addTwitter._execute(
        { userId },
        {
          brandId,
          queryParams: {},
        },
      );

      const integration = Integrations.findOne({ name: 'Twitter' });

      // check field values
      assert.equal(integration.kind, KIND_CHOICES.TWITTER);
      assert.equal(integration.brandId, brandId);
      assert.equal(integration.twitterData.id, twitterUserId);
      assert.equal(integration.twitterData.token, 'access_token');
      assert.equal(integration.twitterData.tokenSecret, 'auth.token_secret');
    });

    describe('remove', function () {
      it('can not remove integration used in channel', function () {
        // create integration
        const integrationId = Factory.create('integration')._id;

        // create channel using integration
        Factory.create('channel', { integrationIds: [integrationId] });

        // check exception
        assert.throws(
          () => {
            remove._execute({ userId }, integrationId);
          },

          Meteor.Error,
          /integrations.remove.usedInChannel/,
        );
      });

      it('remove', function () {
        const integrationId = Factory.create('integration')._id; // create

        assert.equal(Integrations.find().count(), 1); // check created

        remove._execute({ userId }, integrationId); // try to delete

        assert.equal(Integrations.find().count(), 0); // check deleted
      });
    });
  });
});
