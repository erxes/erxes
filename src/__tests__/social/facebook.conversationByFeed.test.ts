import * as sinon from 'sinon';
import { CONVERSATION_STATUSES } from '../../data/constants';
import { connect, disconnect } from '../../db/connection';
import { conversationMessageFactory, integrationFactory } from '../../db/factories';
import { ActivityLogs, ConversationMessages, Conversations, Customers } from '../../db/models';
import { SaveWebhookResponse } from '../../trackers/facebook';
import { graphRequest } from '../../trackers/facebookTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: get or create conversation by feed info', () => {
  afterEach(async () => {
    // clear
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Customers.remove({});
  });

  test('admin posts', async () => {
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

    const value: any = { from: { id: senderId, name: 'Facebook User' } };

    // check invalid verb
    value.verb = 'edit';
    expect(await saveWebhookResponse.getOrCreateConversationByFeed(value)).toBe(null);

    // already saved comments ==========
    await conversationMessageFactory({
      facebookData: { commentId: 1 },
      conversationId: 'DFASFDFAD',
    });

    value.item = null;
    value.comment_id = 1;

    expect(await saveWebhookResponse.getOrCreateConversationByFeed(value)).toBe(null);

    // no message
    await ConversationMessages.remove({});
    value.message = '';
    expect(await saveWebhookResponse.getOrCreateConversationByFeed(value)).toBe(null);

    // access token expired
    value.link = 'link';
    const mock = sinon.stub(graphRequest, 'get').callsFake(() => 'Error processing https request');
    expect(await saveWebhookResponse.getOrCreateConversationByFeed(value)).toBe(null);

    mock.restore();

    // successful ==============
    // mock external requests
    sinon.stub(graphRequest, 'get').callsFake(path => {
      if (path.includes('/?fields=access_token')) {
        return {
          access_token: '244242442442',
        };
      }

      return { name: 'fb user name', id: '123' };
    });

    value.post_id = postId;
    value.message = 'hi';
    value.verb = 'add';

    await saveWebhookResponse.getOrCreateConversationByFeed(value);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message
    expect(await Customers.find().count()).toBe(1); // 1 customer

    // 1 logs
    expect(await ActivityLogs.find({ 'activity.type': 'customer' }).count()).toBe(1);

    const conversation = await Conversations.findOne();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // our posts will be closed automatically
    expect(conversation.status).toBe(CONVERSATION_STATUSES.CLOSED);
  });
});
