/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
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
jest.mock('../transport', () => ({ AgentsChatTransport: class {} }));
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
  expect(sessionStorage.getItem('agents-selected-thread:page')).toBe('b');
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
  expect(sessionStorage.getItem('agents-selected-thread:page')).toBeNull();
});
