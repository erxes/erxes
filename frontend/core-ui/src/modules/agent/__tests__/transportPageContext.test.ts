import type { UIMessage } from 'ai';

import { withUserDisplayText } from '../utils/messages';
import { AgentsChatTransport } from '../transport';

type TPrepare = (options: {
  id: string;
  messages: UIMessage[];
  body?: Record<string, unknown>;
}) => { body: { messages: UIMessage[] } };

let mockPrepare: TPrepare = () => {
  throw new Error('The transport was not constructed.');
};

// `ai` is ESM-only; the base transport only needs its request preparer.
jest.mock('ai', () => ({
  DefaultChatTransport: class {
    constructor(options: { prepareSendMessagesRequest: TPrepare }) {
      mockPrepare = options.prepareSendMessagesRequest;
    }
  },
}));

jest.mock('../api', () => ({
  AGENTS_CHAT_URL: '/agents/chat',
}));

const PAGE_CONTEXT = '[Page context] The user is viewing /contacts.';
const wire = 'Email [[customer:c1:Ann Lee]] today';

it('sends a restored turn without its stored page context on Regenerate', async () => {
  // After a reload the turn comes back from storage with the server's
  // page-context line, the model text and the mention/file data parts.
  const [restored] = withUserDisplayText([
    {
      id: 'm1',
      role: 'user',
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
  ]);
  expect(restored.parts[0]).toEqual({ type: 'text', text: PAGE_CONTEXT });

  new AgentsChatTransport({
    getRequestSelection: () => ({}),
    getPageContext: () => ({ path: '/deals' }),
  });

  // Regenerate drops the reply and resends the turn; the server prepends the
  // current page context, so the client must not resend the stored one.
  const {
    body: {
      messages: [sent],
    },
  } = mockPrepare({
    id: 'thread-1',
    messages: [restored],
  });

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
  // The transcript keeps the stored line for display and Edit.
  expect(restored.parts[0]).toEqual({ type: 'text', text: PAGE_CONTEXT });
});
