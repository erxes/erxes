/* eslint-env mocha */

import sinon from 'sinon';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '/imports/api/conversations/constants';
import { Messages } from '/imports/api/conversations/messages';
import { graphRequest, SaveWebhookResponse } from '../facebook';

describe('facebook integration: get or create conversation', function() {
  const senderId = 2242424244;
  const pageId = '2252525525';

  after(function() {
    graphRequest.get.restore(); // unwraps the spy
  });

  before(function() {
    // clear
    Conversations.remove({});
    Messages.remove({});

    // mock all requests
    sinon.stub(graphRequest, 'get', () => {});
  });

  it('get or create conversation', function() {
    const postId = '32242442442';
    const customerId = Factory.create('customer')._id;
    const integration = Factory.create('integration');

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});
    saveWebhookResponse.currentPageId = pageId;

    // mock getOrCreateCustomer
    sinon.stub(saveWebhookResponse, 'getOrCreateCustomer', () => customerId);

    // check initial states
    assert.equal(Conversations.find().count(), 0);
    assert.equal(Messages.find().count(), 0);

    const facebookData = {
      kind: FACEBOOK_DATA_KINDS.FEED,
      senderId,
      postId,
    };

    const filter = {
      'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
      'facebookData.postId': postId,
    };

    // customer said hi ======================
    saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hi',
    });

    // must be created new conversation, new message
    assert.equal(Conversations.find().count(), 1);
    assert.equal(Messages.find().count(), 1);

    let conversation = Conversations.findOne({});
    assert.equal(conversation.status, CONVERSATION_STATUSES.NEW);

    // customer commented on above converstaion ===========
    saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hey',
    });

    // must not be created new conversation, new message
    assert.equal(Conversations.find().count(), 1);
    assert.equal(Messages.find().count(), 2);

    // close converstaion
    Conversations.update({}, { $set: { status: CONVERSATION_STATUSES.CLOSED } });

    // customer commented on closed converstaion ===========
    saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      conntet: 'hi again',
    });

    // must not be created new conversation, new message
    assert.equal(Conversations.find().count(), 1);

    // must be opened
    conversation = Conversations.findOne({ _id: conversation._id });
    assert.equal(conversation.status, CONVERSATION_STATUSES.OPEN);
    assert.equal(Messages.find().count(), 3);

    // new post ===========
    filter.postId = '34424242444242';

    saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'new sender hi',
    });

    // must be created new conversation, new message
    assert.equal(Conversations.find().count(), 2);
    assert.equal(Messages.find().count(), 4);

    // unwrap getOrCreateCustomer
    saveWebhookResponse.getOrCreateCustomer.restore();
  });
});
