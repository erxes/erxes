import * as sinon from 'sinon';
import * as Twit from 'twit';
import { conversationFactory, customerFactory, integrationFactory } from '../../db/factories';
import { ConversationMessages, Conversations, Customers, Integrations } from '../../db/models';
import { tweetReply, twitMap } from '../../trackers/twitter';
import { twitRequest } from '../../trackers/twitterTracker';

describe('twitter integration', () => {
  let _integration;
  let twit;
  let stub;
  let postMock;

  beforeEach(async () => {
    const sandbox = sinon.createSandbox();

    // create integration
    _integration = await integrationFactory({});

    // Twit instance
    twit = new Twit({
      consumer_key: 'consumer_key',
      consumer_secret: 'consumer_secret',
      access_token: 'access_token',
      access_token_secret: 'token_secret',
    });

    // save twit instance
    twitMap[_integration._id] = twit;

    // twit.post
    postMock = stub = sandbox.stub(twitRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        return resolve({});
      });
    });
  });

  afterEach(async () => {
    // unwrap the spy
    postMock.restore();

    await Conversations.deleteMany({});
    await Integrations.deleteMany({});
    await ConversationMessages.deleteMany({});
    await Customers.deleteMany({});
  });

  test('direct message', async () => {
    const text = 'reply';
    const senderId = 242424242;

    const conversation = await conversationFactory({
      integrationId: _integration._id,
      twitterData: {
        isDirectMessage: true,
        sender_id: senderId,
        sender_id_str: senderId.toString(),
        recipient_id: 535335353,
        recipient_id_str: '535335353',
      },
    });

    // action
    await tweetReply({ conversation, text });

    // check twit post params
    expect(
      stub.calledWith(twit, 'direct_messages/new', {
        user_id: senderId.toString(),
        text,
      }),
    ).toBe(true);
  });

  test('timeline', async () => {
    const text = 'reply';
    const tweetIdStr = '242424242';
    const toScreenName = 'test';

    const customer = await customerFactory({
      twitterData: {
        screen_name: toScreenName,
      },
    });

    const conversation = await conversationFactory({
      customerId: customer._id,
      integrationId: _integration._id,
      twitterData: {
        isDirectMessage: false,
        id_str: tweetIdStr,
      },
    });

    // action
    await tweetReply({ conversation, text, toId: tweetIdStr, toScreenName });

    // check twit post params
    expect(
      stub.calledWith(twit, 'statuses/update', {
        status: `@${toScreenName} ${text}`,

        // replying tweet id
        in_reply_to_status_id: tweetIdStr,
      }),
    ).toBe(true);
  });
});
