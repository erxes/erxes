import * as sinon from 'sinon';
import { FACEBOOK_DATA_KINDS } from '../../data/constants';
import { connect, disconnect } from '../../db/connection';
import { conversationFactory, conversationMessageFactory, integrationFactory } from '../../db/factories';
import { ConversationMessages, Conversations, Integrations } from '../../db/models';
import { facebookReply } from '../../trackers/facebook';
import { graphRequest } from '../../trackers/facebookTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: reply', () => {
  const senderId = 2242424244;
  let integration;
  const pageId = '2252525525';
  let getMock;

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
    getMock = sinon.stub(graphRequest, 'get').callsFake(() => ({
      access_token: 'page_access_token',
    }));
  });

  afterEach(async () => {
    // unwraps the spy
    getMock.restore();

    // clear previous data
    await Conversations.remove({});
    await Integrations.remove({});
    await ConversationMessages.remove({});
  });

  test('messenger', async () => {
    const conversation = await conversationFactory({
      integrationId: integration._id,
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.MESSENGER,
        pageId,
        senderId,
      },
    });
    const msg = await conversationMessageFactory({});

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
    await facebookReply(conversation, { text }, msg);

    // check
    expect(stub.calledWith('me/messages', 'page_access_token')).toBe(true);
    stub.restore();
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

    await conversationMessageFactory({
      conversationId: conversation._id,
      facebookData: {
        isPost: true,
      },
    });

    const text = 'comment';
    const msg = await conversationMessageFactory({
      conversationId: conversation._id,
    });

    // mock post messenger reply
    const gpStub = sinon.stub(graphRequest, 'post').callsFake(() => ({
      id: 'commentId',
    }));

    // mock message update
    const mongoStub = sinon.stub(ConversationMessages, 'update').callsFake(() => {
      '';
    });

    // reply
    await facebookReply(conversation, { text }, msg);

    // check graph request
    expect(gpStub.calledWith('postId/comments', 'page_access_token')).toBe(true);

    // check mongo update
    expect(
      mongoStub.calledWith(
        { _id: msg._id },
        {
          $set: {
            facebookData: {
              commentId: 'commentId',
            },
          },
        },
      ),
    ).toBe(true);
  });
});
