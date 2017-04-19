/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import sinon from 'sinon';
import { assert } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { Messages } from '/imports/api/conversations/messages';
import { graphRequest, SaveWebhookResponse } from '../facebook';

describe('facebook integration: get or create conversation by feed info', function() {
  after(function() {
    graphRequest.get.restore(); // unwraps the spy
  });

  before(function() {
    // clear
    Conversations.remove({});
    Messages.remove({});

    // mock all requests
    sinon.stub(graphRequest, 'get', path => {
      if (path.includes('/?fields=access_token')) {
        return {
          access_token: '244242442442',
        };
      }

      return {};
    });
  });

  it('admin posts', function() {
    const senderId = 'DFDFDEREREEFFFD';
    const postId = 'DFJDFJDIF';

    // indicating sender is our admins, in other words posting from our page
    const pageId = senderId;

    const integration = Factory.create('integration', {
      facebookData: {
        appId: '242424242422',
        pageIds: [pageId, 'DFDFDFDFDFD'],
      },
    });

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration);

    saveWebhookResponse.currentPageId = 'DFDFDFDFDFD';

    // must be 0 conversations
    assert.equal(Conversations.find().count(), 0);

    saveWebhookResponse.getOrCreateConversationByFeed({
      verb: 'add',
      sender_id: senderId,
      post_id: postId,
      message: 'hi all',
    });

    assert.equal(Conversations.find().count(), 1); // 1 conversation

    const conversation = Conversations.findOne();

    // our posts will be closed automatically
    assert.equal(conversation.status, CONVERSATION_STATUSES.CLOSED);
  });
});
