import utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import {
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
  userFactory,
} from '../db/factories';
import { ConversationMessages, Conversations, Customers, Integrations, Users } from '../db/models';

import './setup.ts';

const toJSON = value => {
  // sometimes object key order is different even though it has same value.
  return JSON.stringify(value, Object.keys(value).sort());
};

const spy = jest.spyOn(utils, 'sendNotification');

describe('Conversation message mutations', () => {
  let _conversation;
  let _conversationMessage;
  let _user;
  let _integration;
  let _customer;
  let context;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory({});
    _conversationMessage = await conversationMessageFactory({});
    _user = await userFactory({});
    _customer = await customerFactory({});
    _integration = await integrationFactory({ kind: 'form' });
    _conversation.integrationId = _integration._id;
    _conversation.customerId = _customer._id;
    _conversation.assignedUserId = _user._id;

    await _conversation.save();

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
    await Users.deleteMany({});
    await Integrations.deleteMany({});
    await Customers.deleteMany({});

    spy.mockRestore();
  });

  test('Add conversation message', async () => {
    process.env.DEFAULT_EMAIL_SERIVCE = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

    const args = {
      conversationId: _conversation._id,
      content: _conversationMessage.content,
      mentionedUserIds: [_user._id],
      internal: false,
      attachments: [{ url: 'url', name: 'name', type: 'doc', size: 10 }],
    };

    const mutation = `
      mutation conversationMessageAdd(
        $conversationId: String
        $content: String
        $mentionedUserIds: [String]
        $internal: Boolean
        $attachments: [AttachmentInput]
      ) {
        conversationMessageAdd(
          conversationId: $conversationId
          content: $content
          mentionedUserIds: $mentionedUserIds
          internal: $internal
          attachments: $attachments
        ) {
          conversationId
          content
          mentionedUserIds
          internal
          attachments {
            url
            name
            type
            size
          }
        }
      }
    `;

    const spySendMobileNotification = jest.spyOn(utils, 'sendMobileNotification').mockReturnValueOnce({});
    const message = await graphqlRequest(mutation, 'conversationMessageAdd', args, { user: _user });

    const calledArgs = spySendMobileNotification.mock.calls[0][0];

    expect(calledArgs.title).toBe(`Conversation updated`);
    expect(calledArgs.body).toBe(args.content);
    expect(calledArgs.receivers).toEqual([_conversation.assignedUserId]);
    expect(calledArgs.customerId).toEqual(_conversation.customerId);

    expect(message.content).toBe(args.content);
    expect(message.attachments[0]).toEqual({ url: 'url', name: 'name', type: 'doc', size: 10 });
    expect(toJSON(message.mentionedUserIds)).toEqual(toJSON(args.mentionedUserIds));
    expect(message.internal).toBe(args.internal);
  });

  test('Assign conversation', async () => {
    process.env.DEFAULT_EMAIL_SERIVCE = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

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
    process.env.DEFAULT_EMAIL_SERIVCE = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

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
    process.env.DEFAULT_EMAIL_SERIVCE = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

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
