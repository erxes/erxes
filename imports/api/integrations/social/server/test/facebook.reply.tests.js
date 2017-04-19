/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';

import { Conversations } from '/imports/api/conversations/conversations';
import { FACEBOOK_DATA_KINDS } from '/imports/api/conversations/constants';
import { Integrations } from '/imports/api/integrations/integrations';
import { Messages } from '/imports/api/conversations/messages';

import { graphRequest, facebookReply } from '../facebook';

describe('facebook integration: reply', function () {
  const senderId = 2242424244;
  let integration;
  const pageId = '2252525525';

  beforeEach(function () {
    // clear previous data
    Conversations.remove({});
    Integrations.remove({});
    Messages.remove();

    // mock settings
    Meteor.settings.services.facebook = [{
      id: 'id',
      name: 'name',
      accessToken: 'access_token',
    }];

    // create integration
    integration = Factory.create('integration', {
      'facebookData.appId': 'id',
      'facebookData.pageIds': [pageId],
    });

    // mock get page access token
    sinon.stub(graphRequest, 'get', () => ({
      access_token: 'page_access_token',
    }));
  });

  afterEach(function () {
    // unwraps the spy
    graphRequest.get.restore();
    graphRequest.post.restore();
  });

  it('messenger', function () {
    const conversation = Factory.create('conversation', {
      integrationId: integration._id,
      'facebookData.kind': FACEBOOK_DATA_KINDS.MESSENGER,
      'facebookData.pageId': pageId,
      'facebookData.senderId': senderId,
    });

    const text = 'to messenger';

    // mock post messenger reply
    const stub = sinon.stub(graphRequest, 'post', () => {});

    // reply
    facebookReply(conversation, text);

    // check
    assert.equal(stub.calledWith('me/messages', 'page_access_token'), true);
  });

  it('feed', function () {
    const conversation = Factory.create('conversation', {
      integrationId: integration._id,
      'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
      'facebookData.senderId': 'senderId',
      'facebookData.pageId': 'pageId',
      'facebookData.postId': 'postId',
    });

    const text = 'comment';
    const messageId = '242424242';

    // mock post messenger reply
    const gpStub = sinon.stub(graphRequest, 'post', () => ({
      id: 'commentId',
    }));

    // mock message update
    const mongoStub = sinon.stub(Messages, 'update', () => {});

    // reply
    facebookReply(conversation, text, messageId);

    // check graph request
    assert.equal(gpStub.calledWith('postId/comments', 'page_access_token'), true);

    // check mongo update
    assert.equal(
      mongoStub.calledWith(
        { _id: messageId },
        { $set: { 'facebookData.commentId': 'commentId' } },
      ),
      true,
    );

    // unwrap stub
    Messages.update.restore();
  });
});
