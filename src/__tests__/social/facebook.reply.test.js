/* eslint-env jest */

import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { facebookReply } from '../../trackers/facebook';
import { graphRequest } from '../../trackers/facebookTracker';
import { Integrations, Conversations, ConversationMessages } from '../../db/models';
import { integrationFactory, conversationFactory } from '../../db/factories';
import { FACEBOOK_DATA_KINDS } from '../../data/constants';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: reply', () => {
  const senderId = 2242424244;
  let integration;
  const pageId = '2252525525';

  beforeEach(async () => {
    // mock settings
    process.env.FACEBOOK = JSON.stringify([
      {
        id: 'id',
        name: 'name',
        accessToken: 'access_token',
      },
    ]);

    // create integration
    integration = await integrationFactory({
      facebookData: {
        appId: 'id',
        pageIds: [pageId],
      },
    });

    // mock get page access token
    sinon.stub(graphRequest, 'get').callsFake(() => ({
      access_token: 'page_access_token',
    }));
  });

  afterEach(async () => {
    // unwraps the spy
    graphRequest.get.restore();
    graphRequest.post.restore();

    // clear previous data
    await Conversations.remove({});
    await Integrations.remove({});
    await ConversationMessages.remove();
  });

  test('messenger', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id,
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.MESSENGER,
        pageId: pageId,
        senderId: senderId,
      },
    });

    const text = 'to messenger';

    // mock post messenger reply
    const stub = sinon.stub(graphRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        resolve({
          message_id: 'message_id',
        });
      });
    });

    // reply
    await facebookReply(conversation, text);

    // check
    expect(stub.calledWith('me/messages', 'page_access_token')).toBe(true);
  });

  test('feed', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id,
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.FEED,
        senderId: 'senderId',
        pageId: 'pageId',
        postId: 'postId',
      },
    });

    const text = 'comment';
    const messageId = '242424242';

    // mock post messenger reply
    const gpStub = sinon.stub(graphRequest, 'post').callsFake(() => ({
      id: 'commentId',
    }));

    // mock message update
    const mongoStub = sinon.stub(ConversationMessages, 'update').callsFake(() => {});

    // reply
    await facebookReply(conversation, text, messageId);

    // check graph request
    expect(gpStub.calledWith('postId/comments', 'page_access_token')).toBe(true);

    // check mongo update
    expect(
      mongoStub.calledWith({ _id: messageId }, { $set: { 'facebookData.commentId': 'commentId' } }),
    ).toBe(true);

    // unwrap stub
    ConversationMessages.update.restore();
  });
});
