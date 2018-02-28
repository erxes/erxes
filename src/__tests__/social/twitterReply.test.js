/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import Twit from 'twit';
import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { integrationFactory, conversationFactory, customerFactory } from '../../db/factories';
import { Conversations, ConversationMessages, Customers, Integrations } from '../../db/models';
import { TwitMap, tweetReply } from '../../social/twitter';
import { twitRequest } from '../../social/twitterTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('twitter integration', () => {
  let _integration;
  let twit;
  let stub;

  beforeEach(async () => {
    const sandbox = sinon.sandbox.create();

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
    TwitMap[_integration._id] = twit;

    // twit.post
    stub = sandbox.stub(twitRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        return resolve({});
      });
    });
  });

  afterEach(async () => {
    // unwrap the spy
    twitRequest.post.restore();

    await Conversations.remove({});
    await Integrations.remove({});
    await ConversationMessages.remove({});
    await Customers.remove({});
  });

  test('direct message', async () => {
    const text = 'reply';
    const senderId = 242424242;

    const conversation = await conversationFactory({
      integrationId: _integration._id,
      twitterData: {
        isDirectMessage: true,
        directMessage: {
          senderId,
          senderIdStr: senderId.toString(),
          recipientId: 535335353,
          recipientIdStr: '535335353',
        },
      },
    });

    // action
    await tweetReply(conversation, text);

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
    const screenName = 'test';

    const customer = await customerFactory({
      twitterData: {
        screenName,
      },
    });

    const conversation = await conversationFactory({
      customerId: customer._id,
      integrationId: _integration._id,
      twitterData: {
        isDirectMessage: false,
        idStr: tweetIdStr,
      },
    });

    // action
    await tweetReply(conversation, text);

    // check twit post params
    expect(
      stub.calledWith(twit, 'statuses/update', {
        status: `@${screenName} ${text}`,

        // replying tweet id
        in_reply_to_status_id: tweetIdStr,
      }),
    ).toBe(true);
  });
});
