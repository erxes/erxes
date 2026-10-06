import { sendChannelMessage } from '@/integrations/discord/utils/outbound/send';
import { discordRequest } from '@/integrations/discord/utils/request';
import { CHUNK_SIZE } from '@/integrations/discord/constants/messages';

jest.mock('@/integrations/discord/utils/request', () => ({
  discordRequest: jest.fn(),
  fetchWithNetworkRetry: jest.fn(),
  getErrorMessage: (error: unknown) => String(error),
}));
jest.mock('@/integrations/discord/debuggers', () => ({
  debugError: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/media/attachments', () => ({
  filenameFromUrl: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

it('references the first reply chunk and keeps rich content on the final chunk', async () => {
  const request = jest.mocked(discordRequest).mockResolvedValue({ id: 'sent' });
  const result = await sendChannelMessage({
    token: 'token',
    channelId: 'channel',
    content: 'a'.repeat(CHUNK_SIZE * 2 + 1),
    messageReference: 'original',
    embeds: [{ title: 'Preview' }],
  });
  expect(request).toHaveBeenCalledTimes(3);
  expect(request.mock.calls[0][0].body).toEqual({
    content: 'a'.repeat(CHUNK_SIZE),
    message_reference: {
      type: 0,
      message_id: 'original',
      fail_if_not_exists: true,
    },
  });
  expect(request.mock.calls[1][0].body).toEqual({
    content: 'a'.repeat(CHUNK_SIZE),
  });
  expect(request.mock.calls[2][0].body).toEqual({
    content: 'a',
    embeds: [{ title: 'Preview' }],
  });
  expect(result.id).toBe('sent');
});

it('sends no continuation chunks if Discord rejects the reply reference', async () => {
  const request = jest
    .mocked(discordRequest)
    .mockRejectedValue(new Error('Unknown message'));
  await expect(
    sendChannelMessage({
      token: 'token',
      channelId: 'channel',
      content: 'a'.repeat(CHUNK_SIZE + 1),
      messageReference: 'deleted',
    }),
  ).rejects.toThrow('Unknown message');
  expect(request).toHaveBeenCalledTimes(1);
});
