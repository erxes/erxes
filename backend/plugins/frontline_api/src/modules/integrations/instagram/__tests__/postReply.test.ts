import type { IModels } from '~/connectionResolvers';
import { handleInstagramMessage } from '../handleInstagramMessage';
import { sendReply } from '../utils';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('../utils', () => ({ sendReply: jest.fn() }));
jest.mock('../debuggers', () => ({ debugError: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/conversations', () => ({
  sendNotifications: jest.fn(),
}));

const create = jest.fn(async (doc: Record<string, unknown>) => ({
  toObject: () => ({ _id: 'provider-row', ...doc }),
}));
const models = {
  InstagramCommentConversation: {
    findOne: async () => ({
      postId: 'post',
      comment_id: 'parent',
      recipientId: 'page',
      senderId: 'sender',
    }),
  },
  InstagramPostConversations: { findOne: async () => ({ postId: 'post' }) },
  InstagramCommentConversationReply: { create },
  Conversations: {
    findOne: async () => ({ _id: 'inbox', integrationId: 'integration' }),
  },
} as unknown as IModels;
const reply = () =>
  handleInstagramMessage(
    models,
    {
      action: 'reply-post',
      type: 'instagram-post',
      payload: JSON.stringify({
        conversationId: 'inbox',
        content: '<p>Reply</p>',
        userId: 'agent',
      }),
    },
    'test',
  );

beforeEach(() => jest.clearAllMocks());

test('retains Meta comment identity in provider history and the inbox response', async () => {
  jest.mocked(sendReply).mockResolvedValue({ id: 'meta-comment' });
  await expect(reply()).resolves.toMatchObject({
    status: 'success',
    data: {
      mid: 'meta-comment',
      conversationId: 'inbox',
      providerData: { messageId: 'meta-comment' },
    },
  });
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      comment_id: 'meta-comment',
      mid: 'meta-comment',
      parentId: 'parent',
      content: 'Reply',
    }),
  );
});

test('does not save a successful-looking reply without a Meta ID', async () => {
  jest.mocked(sendReply).mockResolvedValue({});
  await expect(reply()).rejects.toThrow();
  expect(create).not.toHaveBeenCalled();
});
