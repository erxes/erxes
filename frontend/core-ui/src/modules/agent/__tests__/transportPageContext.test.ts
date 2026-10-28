import { randomUUID } from 'node:crypto';
import type { UIMessage } from 'ai';

import { mapStoredMessagesToUIMessages } from '../mapStoredMessages';
import { AgentsChatTransport } from '../transport';

const mockSent: { messages: UIMessage[] }[] = [];

// `ai` is ESM-only; the base transport only needs to record what it sends.
jest.mock('ai', () => ({
  DefaultChatTransport: class {
    sendMessages(options: { messages: UIMessage[] }) {
      mockSent.push(options);
      return Promise.resolve(null);
    }
  },
}));

jest.mock('../api', () => ({
  AGENTS_ANSWER_URL: '/agents/answer',
  AGENTS_APPROVE_URL: '/agents/approve',
  AGENTS_CHAT_RECONNECT_URL: '/agents/chat/reconnect',
  AGENTS_CHAT_URL: '/agents/chat',
}));

// Each normal send starts a new run id.
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID },
  configurable: true,
});

const PAGE_CONTEXT = '[Page context] The user is viewing /contacts.';
const wire = 'Email [[customer:c1:Ann Lee]] today';

it('sends a restored turn without its stored page context on Regenerate', async () => {
  // After a reload the turn comes back from storage with the server's
  // page-context line, the model text and the mention/file data parts.
  const [restored] = mapStoredMessagesToUIMessages([
    {
      id: 'm1',
      role: 'user',
      createdAt: '2026-10-01T00:00:00.000Z',
      content: {
        format: 2,
        parts: [
          { type: 'text', text: PAGE_CONTEXT },
          { type: 'text', text: 'Email @Ann Lee today\n\n[Mentions] …' },
          {
            type: 'data-agents-mentions',
            data: {
              mentions: [{ type: 'customer', id: 'c1', label: 'Ann Lee' }],
              displayText: wire,
            },
          },
        ],
      },
    },
  ]);
  expect(restored.parts[0]).toEqual({ type: 'text', text: PAGE_CONTEXT });

  const onPendingMessage = jest.fn();
  const transport = new AgentsChatTransport({
    getThreadId: () => 'thread-1',
    getRequestSelection: () => ({}),
    getPageContext: () => ({ path: '/deals' }),
    onThreadId: jest.fn(),
    getActiveRunId: () => undefined,
    onActiveRunId: jest.fn(),
    onPendingMessage,
    consumePendingAnswer: () => undefined,
  } as unknown as ConstructorParameters<typeof AgentsChatTransport>[0]);

  // Regenerate drops the reply and resends the turn; the server prepends the
  // current page context, so the client must not resend the stored one.
  await transport.sendMessages({
    trigger: 'regenerate-message',
    chatId: 'chat-1',
    messageId: undefined,
    messages: [restored],
    abortSignal: undefined,
  });

  const [sent] = mockSent[0].messages;
  expect(sent.parts).toEqual([
    { type: 'text', text: wire },
    {
      type: 'data-agents-mentions',
      data: {
        mentions: [{ type: 'customer', id: 'c1', label: 'Ann Lee' }],
        displayText: wire,
      },
    },
  ]);
  expect(onPendingMessage).toHaveBeenCalledWith(sent);
  // The transcript keeps the stored line for display and Edit.
  expect(restored.parts[0]).toEqual({ type: 'text', text: PAGE_CONTEXT });
});
