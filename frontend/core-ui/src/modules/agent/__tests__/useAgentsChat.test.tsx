/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { randomUUID } from 'crypto';
import { useAgentsChat } from '../hooks/useAgentsChat';

jest.mock('ai', () => ({
  isToolUIPart: () => false,
  lastAssistantMessageIsCompleteWithApprovalResponses: () => false,
}));
jest.mock('@ai-sdk/react', () => ({ useChat: jest.fn() }));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(),
}));
let mockOnChatResponse: (accepted: boolean, messageId: string) => void;
jest.mock('../transport', () => ({
  AgentsChatTransport: class {
    constructor(options: {
      onChatResponse: (accepted: boolean, messageId: string) => void;
    }) {
      mockOnChatResponse = options.onChatResponse;
    }
  },
}));
jest.mock('../hooks/useNavigationCatalog', () => ({
  useNavigationCatalog: () => [],
}));
jest.mock('../mapStoredMessages', () => ({
  mapStoredMessagesToUIMessages: (messages: unknown) => messages,
}));

import { useChat } from '@ai-sdk/react';
import { useLazyQuery } from '@apollo/client';

const load = jest.fn();
const setMessages = jest.fn();
const stop = jest.fn(async () => undefined);
const noop = jest.fn();

const deferred = () => {
  let resolve!: (value: unknown) => void;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const detail = (id: string) => ({
  data: {
    agentsThreadDetail: {
      messages: [
        { id, role: 'assistant', parts: [{ type: 'text', text: id }] },
      ],
    },
  },
});

beforeAll(() =>
  Object.defineProperty(crypto, 'randomUUID', {
    value: randomUUID,
    configurable: true,
  }),
);

beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  (useLazyQuery as jest.Mock).mockReturnValue([load]);
  (useChat as jest.Mock).mockReturnValue({
    messages: [],
    status: 'ready',
    sendMessage: noop,
    setMessages,
    clearError: noop,
    stop,
    addToolApprovalResponse: noop,
    resumeStream: noop,
    regenerate: noop,
  });
});

it('keeps the latest selected thread when an older request resolves last', async () => {
  const a = deferred();
  const b = deferred();
  load.mockImplementation(
    ({ variables }: { variables: { threadId: string } }) =>
      variables.threadId === 'a' ? a.promise : b.promise,
  );
  const { result } = renderHook(() => useAgentsChat());
  let openA!: Promise<void>;
  let openB!: Promise<void>;
  await act(async () => {
    openA = result.current.openThread('a');
  });
  await act(async () => {
    openB = result.current.openThread('b');
  });
  await act(async () => {
    b.resolve(detail('b'));
    await openB;
  });
  await act(async () => {
    a.resolve(detail('a'));
    await openA;
  });
  expect(result.current.threadId).toBe('b');
  expect(sessionStorage.getItem('agents-selected-thread:panel')).toBe('b');
  expect(setMessages).toHaveBeenCalledTimes(1);
  expect(setMessages.mock.calls[0][0][0].id).toBe('b');
});

it('does not restore a pending thread after starting a new conversation', async () => {
  const pending = deferred();
  load.mockReturnValue(pending.promise);
  const { result } = renderHook(() => useAgentsChat());
  let opening!: Promise<void>;
  await act(async () => {
    opening = result.current.openThread('old');
  });
  await act(async () => {
    await result.current.startNewConversation();
  });
  await act(async () => {
    pending.resolve(detail('old'));
    await opening;
  });
  expect(result.current.threadId).toBeUndefined();
  expect(setMessages).toHaveBeenLastCalledWith([]);
  expect(sessionStorage.getItem('agents-selected-thread:panel')).toBeNull();
});

const editHistory = [
  { id: 'first', role: 'user', parts: [{ type: 'text', text: 'Hello' }] },
  { id: 'reply', role: 'assistant', parts: [{ type: 'text', text: 'Hi' }] },
  {
    id: 'edit-me',
    role: 'user',
    parts: [
      { type: 'text', text: '[Page context] The user is viewing /contacts.' },
      { type: 'text', text: 'Old prompt' },
      {
        type: 'data-agents-files',
        data: {
          files: [
            {
              name: 'report.csv',
              url: 'report-key',
              type: 'text/csv',
              size: 10,
            },
          ],
        },
      },
    ],
  },
  {
    id: 'later',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Old answer' }],
  },
];

const mockEditableChat = (status = 'ready') => {
  const send = jest.fn(async () => undefined);
  (useChat as jest.Mock).mockReturnValue({
    messages: editHistory,
    status,
    sendMessage: send,
    setMessages,
    clearError: noop,
    stop,
    addToolApprovalResponse: noop,
    resumeStream: noop,
    regenerate: noop,
  });
  return send;
};

it('uses SDK message replacement while retaining the original attachments and page context', () => {
  const send = mockEditableChat();
  const { result } = renderHook(() => useAgentsChat());
  act(() => result.current.editMessage('edit-me', '  Revised prompt  '));
  expect(send).toHaveBeenCalledWith(
    {
      messageId: 'edit-me',
      parts: [
        editHistory[2].parts[2],
        { type: 'text', text: 'Revised prompt' },
      ],
      metadata: undefined,
    },
    { body: { editMessageId: 'edit-me', pageContext: { path: '/contacts' } } },
  );
});

it('restores the full transcript when the server rejects an edit', () => {
  mockEditableChat();
  const { result } = renderHook(() => useAgentsChat());
  act(() => result.current.editMessage('edit-me', 'Revised prompt'));
  act(() => mockOnChatResponse(false, 'edit-me'));
  expect(setMessages).toHaveBeenLastCalledWith(editHistory);
});

it('does not restore a rejected edit into a different conversation', async () => {
  mockEditableChat();
  const { result } = renderHook(() => useAgentsChat());
  act(() => result.current.editMessage('edit-me', 'Revised prompt'));
  await act(async () => result.current.startNewConversation());
  act(() => mockOnChatResponse(false, 'edit-me'));
  expect(setMessages).toHaveBeenLastCalledWith([]);
});

it('does not edit assistant messages or interrupt a streaming response', () => {
  const send = mockEditableChat('streaming');
  const { result } = renderHook(() => useAgentsChat());
  act(() => result.current.editMessage('edit-me', 'Revised prompt'));
  act(() => result.current.editMessage('reply', 'Revised prompt'));
  expect(send).not.toHaveBeenCalled();
});
