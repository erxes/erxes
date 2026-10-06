import type { IModels } from '~/connectionResolvers';
import type { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import type { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';
import type { APIMessage } from 'discord-api-types/v10';
import { resolveReplyTarget } from '@/integrations/discord/utils/outbound/replyPayload';
import { mirrorSentMessageToInbox } from '@/integrations/discord/services/automation/mirror';
import { resolveConversationTarget } from '@/integrations/discord/services/automation/target';
import { receiveDiscordMessageEdit } from '@/integrations/discord/controller/receiveMessageUpdates';
import { syncConversationToCore } from '@/integrations/discord/services/persistence/conversations';
import { handleDiscordReaction } from '@/integrations/discord/services/messages/actions';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import {
  updateInboxMessageExtra,
  resolveConversationByMessageId,
} from '@/integrations/discord/services/messages/inboxUpdates';
import { removeChannelMessageReaction } from '@/integrations/discord/utils/outbound/actions';
import { mapMessageCreateToActivity } from '@/integrations/discord/utils/messages/activity';

jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('@/integrations/discord/debuggers', () => ({
  debugError: jest.fn(),
  debugDiscord: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/outbound/send', () => ({
  sendChannelMessage: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/media/attachments', () => ({
  rehostImageAttachments: jest.fn(
    async (_subdomain: string, attachments: unknown[]) => attachments,
  ),
  rehostUpdatedImageAttachments: jest.fn(),
  resolveAttachmentUrl: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/channels', () => ({
  getChannel: jest.fn(),
  isThreadChannel: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/bot', () => ({
  openDmChannel: jest.fn(),
}));
jest.mock('@/integrations/discord/services/messages/inboxUpdates', () => ({
  resolveConversationByMessageId: jest.fn(),
  updateInboxMessageExtra: jest.fn(),
}));
jest.mock('@/integrations/discord/utils/outbound/actions', () => ({
  addChannelMessageReaction: jest.fn(),
  removeChannelMessageReaction: jest.fn(),
  pinChannelMessage: jest.fn(),
  unpinChannelMessage: jest.fn(),
}));
jest.mock('@/integrations/discord/services/messages/events', () => ({
  buildDiscordReactionUpdate: jest.fn(() => []),
  publishDiscordMessage: jest.fn(),
}));

// Model boundaries are mocked so these regressions never touch tenant data.
const modelsFrom = (models: object): IModels => models as IModels;

beforeEach(() => jest.clearAllMocks());

it('rejects missing and deleted replies in the current conversation', async () => {
  const findOne = jest
    .fn()
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ deletedAt: new Date() });
  const models = modelsFrom({ DiscordConversationMessages: { findOne } });
  await expect(
    resolveReplyTarget(models, 'conversation', 'missing'),
  ).rejects.toThrow('Reply target was not found');
  await expect(
    resolveReplyTarget(models, 'conversation', 'deleted'),
  ).rejects.toThrow('Reply target was not found');
});

it('rejects an absent automation conversation ID before accessing models', async () => {
  const findOne = jest.fn();
  const models = modelsFrom({ DiscordConversations: { findOne } });
  await expect(
    resolveConversationTarget(models, { target: {} } as Parameters<
      typeof resolveConversationTarget
    >[1]),
  ).rejects.toThrow('requires a conversation ID');
  expect(findOne).not.toHaveBeenCalled();
});

it('keeps the Discord identity on a plain text automation reply', async () => {
  const models = modelsFrom({
    DiscordConversationMessages: { create: jest.fn() },
  });
  await mirrorSentMessageToInbox({
    models,
    subdomain: 'test',
    conversation: {
      _id: 'mirror',
      erxesApiId: 'inbox',
    } as IDiscordConversationDocument,
    sent: {
      id: 'discord-message',
      attachments: [],
      embeds: [],
    } as unknown as APIMessage,
    content: 'Plain text',
  });
  const [, request] = jest.mocked(receiveInboxMessage).mock.calls[0];
  const payload: {
    extraData: { discordMessageId: string };
    providerData: { messageId: string };
  } = JSON.parse(request.payload || '{}');
  expect(payload.extraData.discordMessageId).toBe('discord-message');
  expect(payload.providerData.messageId).toBe('discord-message');
});

it('clears an embed preview when Discord explicitly removes all embeds', async () => {
  jest.mocked(resolveConversationByMessageId).mockResolvedValue({
    message: { _id: 'mirror-message', content: 'old link' },
    conversation: { erxesApiId: 'inbox' },
  } as unknown as NonNullable<
    Awaited<ReturnType<typeof resolveConversationByMessageId>>
  >);
  await receiveDiscordMessageEdit({
    models: modelsFrom({}),
    subdomain: 'test',
    activity: mapMessageCreateToActivity({
      id: 'discord-message',
      channel_id: 'channel',
      embeds: [],
    }),
  });
  expect(updateInboxMessageExtra).toHaveBeenCalledWith(
    expect.anything(),
    'test',
    'discord-message',
    { embeds: [] },
    {},
  );
});

it('restores a deleted conversation mirror without saving a stale document', async () => {
  const stale = {
    _id: 'mirror',
    channelId: 'channel',
    save: jest.fn(),
    toObject: () => ({ _id: 'mirror', channelId: 'channel' }),
  } as unknown as IDiscordConversationDocument;
  const restored = { _id: 'mirror', erxesApiId: 'inbox' };
  const findOneAndUpdate = jest
    .fn()
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(restored);
  jest
    .mocked(receiveInboxMessage)
    .mockResolvedValue({ status: 'success', data: { _id: 'inbox' } });
  const result = await syncConversationToCore({
    models: modelsFrom({
      DiscordConversations: {
        findOneAndUpdate,
        findById: jest.fn().mockResolvedValue(null),
      },
    }),
    subdomain: 'test',
    bot: { erxesApiId: 'integration' } as IDiscordBotDocument,
    conversation: stale,
    createdInThisCall: false,
    customer: { erxesApiId: 'customer' } as IDiscordCustomerDocument,
    previewContent: 'Hello',
    storedAttachments: [],
    timestamp: new Date(),
  });
  expect(result).toBe(restored);
  expect(stale.save).not.toHaveBeenCalled();
});

it('preserves the shared Discord reaction when another agent still owns the emoji', async () => {
  const models = modelsFrom({
    DiscordConversations: {
      findOne: jest.fn().mockResolvedValue({ channelId: 'channel' }),
    },
    DiscordBots: {
      findOne: jest.fn(() => ({
        sort: jest
          .fn()
          .mockResolvedValue({ token: 'token', applicationId: 'bot' }),
      })),
    },
    ConversationMessages: {
      exists: jest.fn().mockResolvedValue({ _id: 'inbox-message' }),
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValue({ toObject: () => ({ _id: 'inbox-message' }) }),
    },
  });
  await handleDiscordReaction(models, {
    integrationId: 'integration',
    conversationId: 'inbox',
    messageId: 'discord-message',
    reaction: '👍',
    remove: true,
    userId: 'agent-a',
  });
  expect(removeChannelMessageReaction).not.toHaveBeenCalled();
});
