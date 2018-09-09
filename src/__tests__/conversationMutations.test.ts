import * as faker from 'faker';
import * as sinon from 'sinon';
import utils from '../data/utils';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import {
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
  userFactory,
} from '../db/factories';
import { ConversationMessages, Conversations, Customers, Integrations, Users } from '../db/models';
import { TwitMap } from '../trackers/twitter';
import { twitRequest } from '../trackers/twitterTracker';

beforeAll(() => connect());

afterAll(() => disconnect());

const toJSON = value => {
  return JSON.stringify(value);
};

const spy = jest.spyOn(utils, 'sendNotification');

describe('Conversation message mutations', () => {
  let _conversation;
  let _conversationMessage;
  let _user;
  let _integration;
  let _integrationTwitter;
  let _customer;
  let context;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory({});
    _conversationMessage = await conversationMessageFactory({});
    _user = await userFactory({});
    _customer = await customerFactory({});
    _integration = await integrationFactory({ kind: 'form' });
    _integrationTwitter = await integrationFactory({ kind: 'twitter' });
    _conversation.integrationId = _integration._id;
    _conversation.customerId = _customer._id;
    _conversation.assignedUserId = _user._id;

    await _conversation.save();

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Users.remove({});
    await Integrations.remove({});
    await Customers.remove({});

    spy.mockRestore();
  });

  test('Add conversation message', async () => {
    const args = {
      conversationId: _conversation._id,
      content: _conversationMessage.content,
      mentionedUserIds: [_user._id],
      internal: false,
      attachments: [{ url: 'url' }],
      tweetReplyToId: faker.random.number(),
      tweetReplyToScreenName: faker.name.firstName(),
    };

    const mutation = `
      mutation conversationMessageAdd(
        $conversationId: String
        $content: String
        $mentionedUserIds: [String]
        $internal: Boolean
        $attachments: [JSON]
        $tweetReplyToId: String
        $tweetReplyToScreenName: String
      ) {
        conversationMessageAdd(
          conversationId: $conversationId
          content: $content
          mentionedUserIds: $mentionedUserIds
          internal: $internal
          attachments: $attachments
          tweetReplyToId: $tweetReplyToId
          tweetReplyToScreenName: $tweetReplyToScreenName
        ) {
          conversationId
          content
          mentionedUserIds
          internal
          attachments
        }
      }
    `;

    const message = await graphqlRequest(mutation, 'conversationMessageAdd', args);

    expect(message.content).toBe(args.content);
    expect(message.attachments[0].toJSON()).toEqual({ url: 'url' });
    expect(toJSON(message.mentionedUserIds)).toEqual(toJSON(args.mentionedUserIds));
    expect(message.internal).toBe(args.internal);
  });

  test('Tweet conversation', async () => {
    const twit = {};

    TwitMap[_integrationTwitter._id] = twit;

    const args = {
      integrationId: _integrationTwitter._id,
      text: faker.random.word(),
    };

    // mock twitter request
    const sandbox = sinon.sandbox.create();

    const stub = sandbox.stub(twitRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        resolve({});
      });
    });

    const mutation = `
      mutation conversationsTweet($integrationId: String $text: String) {
        conversationsTweet(integrationId: $integrationId text: $text)
      }
    `;

    await graphqlRequest(mutation, 'conversationsTweet', args);

    // check twit post params
    expect(
      stub.calledWith(twit, 'statuses/update', {
        status: args.text,
      }),
    ).toBe(true);

    stub.restore();
  });

  test('Retweet conversation', async () => {
    const twit = {};

    const args = {
      integrationId: _integrationTwitter._id,
      id: '123',
    };

    TwitMap[_integrationTwitter._id] = twit;

    // mock twitter request
    const sandbox = sinon.sandbox.create();

    // mock retweet request
    const postStub = sandbox.stub(twitRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        resolve({
          retweeted_status: {
            id_str: '123',
          },
        });
      });
    });

    // mock get tweet object request
    const getStub = sandbox.stub(twitRequest, 'get').callsFake(() => {
      return new Promise(resolve => {
        resolve({});
      });
    });

    const mutation = `
      mutation conversationsRetweet($integrationId: String $id: String) {
        conversationsRetweet(integrationId: $integrationId id: $id)
      }
    `;

    await graphqlRequest(mutation, 'conversationsRetweet', args);

    // check twit post params
    expect(
      postStub.calledWith(twit, 'statuses/retweet/:id', {
        id: args.id,
      }),
    ).toBe(true);

    postStub.restore();
    getStub.restore();
  });

  test('Favorite tweet', async () => {
    const twit = {};

    const args = {
      integrationId: _integrationTwitter._id,
      id: '123',
    };

    TwitMap[_integrationTwitter._id] = twit;

    // mock twitter request
    const sandbox = sinon.sandbox.create();

    // mock retweet request
    const postStub = sandbox.stub(twitRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        resolve({
          id_str: '123',
        });
      });
    });

    // mock get tweet object request
    const getStub = sandbox.stub(twitRequest, 'get').callsFake(() => {
      return new Promise(resolve => {
        resolve({});
      });
    });

    const mutation = `
      mutation conversationsFavorite($integrationId: String $id: String) {
        conversationsFavorite(integrationId: $integrationId id: $id)
      }
    `;

    await graphqlRequest(mutation, 'conversationsFavorite', args);

    // check twit post params
    expect(
      postStub.calledWith(twit, 'favorites/create', {
        id: args.id,
      }),
    ).toBe(true);

    postStub.restore();
    getStub.restore();
  });

  test('Assign conversation', async () => {
    const args = {
      conversationIds: [_conversation._id],
      assignedUserId: _user._id,
    };

    const mutation = `
      mutation conversationsAssign(
        $conversationIds: [String]!
        $assignedUserId: String
      ) {
        conversationsAssign(
          conversationIds: $conversationIds
          assignedUserId: $assignedUserId
        ) {
          assignedUser {
            _id
          }
        }
      }
    `;

    const [conversation] = await graphqlRequest(mutation, 'conversationsAssign', args, context);

    expect(conversation.assignedUser._id).toEqual(args.assignedUserId);
  });

  test('Unassign conversation', async () => {
    const mutation = `
      mutation conversationsUnassign($_ids: [String]!) {
        conversationsUnassign(_ids: $_ids) {
          assignedUser {
            _id
          }
        }
      }
    `;

    const [conversation] = await graphqlRequest(mutation, 'conversationsUnassign', {
      _ids: [_conversation._id],
    });

    expect(conversation.assignedUser).toBe(null);
  });

  test('Change conversation status', async () => {
    const args = {
      _ids: [_conversation._id],
      status: 'closed',
    };

    const mutation = `
      mutation conversationsChangeStatus($_ids: [String]!, $status: String!) {
        conversationsChangeStatus(_ids: $_ids, status: $status) {
          status
        }
      }
    `;

    const [conversation] = await graphqlRequest(mutation, 'conversationsChangeStatus', args);

    expect(conversation.status).toEqual(args.status);
  });

  test('Mark conversation as read', async () => {
    const mutation = `
      mutation conversationMarkAsRead($_id: String) {
        conversationMarkAsRead(_id: $_id) {
          _id
          readUserIds
        }
      }
    `;

    const conversation = await graphqlRequest(mutation, 'conversationMarkAsRead', { _id: _conversation._id }, context);

    expect(conversation.readUserIds).toContain(_user._id);
  });
});
