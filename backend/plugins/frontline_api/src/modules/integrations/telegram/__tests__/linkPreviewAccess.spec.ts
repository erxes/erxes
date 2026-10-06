import type { IContext } from '~/connectionResolvers';
import { telegramQueries } from '../graphql/resolvers/queries';
import { getTelegramLinkPreviews } from '../utils/linkPreview';

jest.mock('@/integrations/telegram/client', () => ({}));
jest.mock('@/channel/utils', () => ({
  visibleChannelsFilter: jest.fn().mockResolvedValue({ memberIds: 'staff' }),
}));
jest.mock('../utils/linkPreview', () => ({
  getTelegramLinkPreviews: jest.fn(),
}));

const checkPermission = jest.fn();
const findMessage = jest.fn();
const integrationExists = jest.fn();
const findConversation = jest.fn();
const visibleChannels = jest.fn().mockResolvedValue(['visible-channel']);
// Mock only the tenant model/context boundary used by this resolver.
const context = {
  subdomain: 'tenant-a',
  user: { _id: 'staff' },
  checkPermission,
  models: {
    ConversationMessages: { findOne: findMessage },
    Conversations: { findOne: findConversation },
    Channels: { find: () => ({ distinct: visibleChannels }) },
    Integrations: { exists: integrationExists },
  },
} as unknown as IContext;

beforeEach(() => {
  jest.clearAllMocks();
  checkPermission.mockResolvedValue(undefined);
  findMessage.mockResolvedValue({
    conversationId: 'conversation',
    content: 'https://example.com',
  });
  findConversation.mockResolvedValue({ integrationId: 'integration' });
  integrationExists.mockResolvedValue({ _id: 'integration' });
  jest.mocked(getTelegramLinkPreviews).mockResolvedValue([]);
});

const read = () =>
  telegramQueries.telegramMessageLinkPreviews(
    undefined,
    { messageId: 'message' },
    context,
  );

test('requires permission before reading or requesting preview data', async () => {
  checkPermission.mockRejectedValue(new Error('Permission denied'));
  await expect(read()).rejects.toThrow('Permission denied');
  expect(checkPermission).toHaveBeenCalledWith('showConversations');
  expect(findMessage).not.toHaveBeenCalled();
  expect(getTelegramLinkPreviews).not.toHaveBeenCalled();
});

test('does not fetch previews for an internal note or an inaccessible integration', async () => {
  findMessage.mockResolvedValueOnce({ internal: true });
  await expect(read()).resolves.toEqual([]);
  integrationExists.mockResolvedValueOnce(null);
  await expect(read()).resolves.toEqual([]);
  expect(getTelegramLinkPreviews).not.toHaveBeenCalled();
});

test('uses stored message content and the visible Telegram integration in this tenant', async () => {
  await read();
  expect(integrationExists).toHaveBeenCalledWith({
    _id: 'integration',
    kind: 'telegram-messenger',
    channelId: { $in: ['visible-channel'] },
  });
  expect(getTelegramLinkPreviews).toHaveBeenCalledWith(
    'tenant-a',
    'https://example.com',
  );
});
