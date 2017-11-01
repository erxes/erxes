/* eslint-env jest */

import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { graphRequest, SaveWebhookResponse } from '../../social/facebook';
import { Conversations, ConversationMessages } from '../../db/models';
import { integrationFactory } from '../../db/factories';
import { CONVERSATION_STATUSES } from '../../data/constants';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: get or create conversation by feed info', () => {
  beforeEach(() => {
    // mock all requests
    sinon.stub(graphRequest, 'get').callsFake(path => {
      if (path.includes('/?fields=access_token')) {
        return {
          access_token: '244242442442',
        };
      }

      return {};
    });
  });

  afterEach(async () => {
    // clear
    await Conversations.remove({});
    await ConversationMessages.remove({});

    graphRequest.get.restore(); // unwraps the spy
  });

  it('admin posts', async () => {
    const senderId = 'DFDFDEREREEFFFD';
    const postId = 'DFJDFJDIF';

    // indicating sender is our admins, in other words posting from our page
    const pageId = senderId;

    const integration = await integrationFactory({
      facebookData: {
        appId: '242424242422',
        pageIds: [pageId, 'DFDFDFDFDFD'],
      },
    });

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration);

    saveWebhookResponse.currentPageId = 'DFDFDFDFDFD';

    // must be 0 conversations
    expect(await Conversations.find().count()).toBe(0);

    await saveWebhookResponse.getOrCreateConversationByFeed({
      verb: 'add',
      sender_id: senderId,
      post_id: postId,
      message: 'hi all',
    });

    expect(await Conversations.find().count()).toBe(1); // 1 conversation

    const conversation = await Conversations.findOne();

    // our posts will be closed automatically
    expect(conversation.status).toBe(CONVERSATION_STATUSES.CLOSED);
  });
});
