import type { IModels } from '~/connectionResolvers';
import { getOrCreatePostConversation } from '../controller/store';
import { getPostLink } from '../utils';
import { INTEGRATION_KINDS } from '../constants';

jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('../utils', () => ({ getPostLink: jest.fn() }));
jest.mock('../debuggers', () => ({ debugError: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

type Post = {
  postId: string;
  metadataPending: boolean;
  content: string;
  permalink_url: string;
  recipientId: string;
  save: jest.Mock;
};
let post: Post | null;
const create = jest.fn(async (doc: Omit<Post, 'save'>) => {
  post = { ...doc, save: jest.fn() };
  return post;
});
const findIntegration = jest
  .fn()
  .mockResolvedValue({ _id: 'post-integration', accountId: 'account' });
const models = {
  InstagramPostConversations: { findOne: async () => post, create },
  InstagramIntegrations: { findOne: findIntegration },
  InstagramAccounts: { findOne: async () => ({ token: 'test-token' }) },
} as unknown as IModels;

beforeEach(() => {
  jest.clearAllMocks();
  post = null;
});

test.each([null, {}, { id: 'media', timestamp: 'invalid' }])(
  'keeps the known post ID when preview is unusable: %j',
  async (details) => {
    jest.mocked(getPostLink).mockResolvedValue(details);
    await expect(
      getOrCreatePostConversation(models, 'page', 'media'),
    ).resolves.toMatchObject({
      postId: 'media',
      recipientId: 'page',
      metadataPending: true,
      content: '',
    });
    expect(findIntegration).toHaveBeenCalledWith({
      instagramPageId: 'page',
      kind: INTEGRATION_KINDS.POST,
    });
  },
);

test('retries missing previews on a later comment without creating another post', async () => {
  jest
    .mocked(getPostLink)
    .mockRejectedValueOnce(new Error('Permission denied'));
  await getOrCreatePostConversation(models, 'page', 'media');
  jest
    .mocked(getPostLink)
    .mockResolvedValue({
      id: 'media',
      caption: 'Recovered preview',
      permalink: 'https://instagram.com/p/test',
      timestamp: '2026-10-27T00:00:00Z',
    });
  await expect(
    getOrCreatePostConversation(models, 'page', 'media'),
  ).resolves.toMatchObject({
    metadataPending: false,
    content: 'Recovered preview',
  });
  await getOrCreatePostConversation(models, 'page', 'media');
  expect(create).toHaveBeenCalledTimes(1);
  expect(getPostLink).toHaveBeenCalledTimes(2);
});

test('a captionless post is a valid preview', async () => {
  jest
    .mocked(getPostLink)
    .mockResolvedValue({
      id: 'media',
      permalink: 'https://instagram.com/p/test',
    });
  await expect(
    getOrCreatePostConversation(models, 'page', 'media'),
  ).resolves.toMatchObject({ content: '', metadataPending: false });
});

test('post persistence failure still propagates for webhook retry', async () => {
  jest.mocked(getPostLink).mockResolvedValue(null);
  create.mockRejectedValueOnce(new Error('Database unavailable'));
  await expect(
    getOrCreatePostConversation(models, 'page', 'media'),
  ).rejects.toThrow('Database unavailable');
});
