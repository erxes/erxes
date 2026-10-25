import { pageSelectionsPart } from '../pageSelections';
/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { randomUUID } from 'crypto';
import { useAgentsChat } from '../hooks/useAgentsChat';
import type { IAgentsRequestSelection } from '../transport';

jest.mock('ai', () => ({
  isToolUIPart: () => false,
  lastAssistantMessageIsCompleteWithApprovalResponses: () => false,
}));
jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(),
  Chat: jest.fn(() => ({ stop: jest.fn() })),
}));
// A real normalized cache behind a minimal client, so reads, evictions and
// prefetches behave as they do against the app's Apollo client.
const mockApolloClient = {
  cache: undefined as unknown as InMemoryCache,
  readQuery: (options: Parameters<InMemoryCache['readQuery']>[0]) =>
    mockApolloClient.cache.readQuery(options),
  query: jest.fn(async () => ({ data: undefined })),
};
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(),
  useApolloClient: () => mockApolloClient,
}));
let mockPendingMessage: (message: import('ai').UIMessage) => void;
let mockSetActiveRunId: (runId: string | undefined) => void;
let mockOnChatResponse: (accepted: boolean, messageId: string) => void;
let mockGetRequestSelection: () => IAgentsRequestSelection;
jest.mock('../transport', () => ({
  AgentsChatTransport: class {
    constructor(options: {
      getRequestSelection: () => IAgentsRequestSelection;
      onChatResponse: (accepted: boolean, messageId: string) => void;
      onActiveRunId: (runId: string | undefined) => void;
      onPendingMessage: (message: import('ai').UIMessage) => void;
    }) {
      mockOnChatResponse = options.onChatResponse;
      mockSetActiveRunId = options.onActiveRunId;
      mockPendingMessage = options.onPendingMessage;
      mockGetRequestSelection = options.getRequestSelection;
    }
  },
}));
jest.mock('../hooks/useNavigationCatalog', () => ({
  useNavigationCatalog: () => [],
}));
jest.mock('../mapStoredMessages', () => ({
  mapStoredMessagesToUIMessages: (messages: unknown) => messages,
}));

import { Chat, useChat } from '@ai-sdk/react';
import { InMemoryCache, useLazyQuery } from '@apollo/client';
import { AGENTS_THREAD_DETAIL } from '../graphql/threads';

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
  mockApolloClient.cache = new InMemoryCache();
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

it('defaults the thinking picker and outgoing request selection to high', () => {
  const { result } = renderHook(() => useAgentsChat());

  expect(result.current.thinkingLevel).toBe('high');
  expect(mockGetRequestSelection().thinkingLevel).toBe('high');
});

it.each(['off', 'minimal', 'low', 'medium', 'high'] as const)(
  'uses an explicit thinking level of %s instead of the default',
  (level) => {
    const { result } = renderHook(() => useAgentsChat());

    act(() => result.current.selectThinkingLevel(level));

    expect(result.current.thinkingLevel).toBe(level);
    expect(mockGetRequestSelection().thinkingLevel).toBe(level);
  },
);

it('clamps only the sent level, keeping the choice for deeper models', () => {
  const { result } = renderHook(() => useAgentsChat());

  act(() => result.current.selectThinkingLevel('max'));
  // A model without Max: the request is clamped, the choice is kept.
  act(() => result.current.setThinkingLevels(['off', 'low', 'medium', 'high']));
  expect(mockGetRequestSelection().thinkingLevel).toBe('high');
  expect(result.current.thinkingLevel).toBe('max');
  // Switching back to a model with Max sends Max again.
  act(() =>
    result.current.setThinkingLevels(['off', 'low', 'high', 'xhigh', 'max']),
  );
  expect(mockGetRequestSelection().thinkingLevel).toBe('max');
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

const mockEditableChat = (
  status = 'ready',
  messages: unknown[] = editHistory,
) => {
  const send = jest.fn(async () => undefined);
  (useChat as jest.Mock).mockReturnValue({
    messages,
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

it('retains typed page selections when editing a question', () => {
  const selection = pageSelectionsPart([
    {
      id: '47b58525-fceb-48ee-9262-dcd040c63bb2',
      title: 'Company',
      path: '/contacts',
      text: 'Company',
      width: 200,
      height: 60,
      snapshot: { url: 'snapshot.png', type: 'image/png', size: 68 },
    },
  ]);
  const send = mockEditableChat('ready', [
    {
      id: 'selected',
      role: 'user',
      parts: [{ type: 'text', text: 'Question' }, selection],
    },
  ]);
  const { result } = renderHook(() => useAgentsChat());
  act(() => result.current.editMessage('selected', 'New question'));
  expect(send).toHaveBeenCalledWith(
    expect.objectContaining({
      parts: [selection, { type: 'text', text: 'New question' }],
    }),
    expect.anything(),
  );
});

it('detaches the old stream without forgetting its durable run, then reattaches when reopened', async () => {
  const resume = jest.fn(async () => undefined);
  (useChat as jest.Mock).mockReturnValue({
    messages: [],
    status: 'ready',
    sendMessage: noop,
    setMessages,
    clearError: noop,
    stop,
    addToolApprovalResponse: noop,
    resumeStream: resume,
    regenerate: noop,
  });
  load.mockResolvedValue(detail('old'));
  const { result } = renderHook(() => useAgentsChat());
  await act(async () => result.current.openThread('old'));
  act(() => mockSetActiveRunId('durable-old-run'));
  const ending = deferred();
  stop.mockImplementationOnce(() => ending.promise as Promise<void>);
  let switching!: Promise<void>;
  await act(async () => {
    switching = result.current.startNewConversation();
  });
  expect(result.current.threadId).toBe('old');
  await act(async () => {
    const options = (Chat as jest.Mock).mock.calls.at(-1)?.[0] as {
      onFinish: (input: unknown) => void;
    };
    options.onFinish({
      message: { parts: [] },
      isAbort: true,
      isDisconnect: false,
    });
    ending.resolve(undefined);
    await switching;
  });
  expect(sessionStorage.getItem('agents-active-run:old')).toBe(
    'durable-old-run',
  );
  expect(result.current.threadId).toBeUndefined();
  expect(setMessages).toHaveBeenLastCalledWith([]);
  await act(async () => result.current.openThread('old'));
  expect(resume).toHaveBeenCalledTimes(1);
  expect(result.current.canReconnect).toBe(true);
});

it('reopens the reported stored user/reply pair without manufacturing a second pair', async () => {
  const resume = jest.fn(async () => undefined);
  (useChat as jest.Mock).mockReturnValue({
    messages: [],
    status: 'ready',
    sendMessage: noop,
    setMessages,
    clearError: noop,
    stop,
    addToolApprovalResponse: noop,
    resumeStream: resume,
    regenerate: noop,
  });
  const user = {
    id: 'sdk-user',
    role: 'user' as const,
    parts: [{ type: 'text' as const, text: 'Sales report in last month' }],
  };
  load.mockResolvedValue(detail('old'));
  const { result } = renderHook(() => useAgentsChat());
  await act(async () => result.current.openThread('old'));
  act(() => {
    mockPendingMessage(user);
    mockSetActiveRunId('live-run');
  });
  load.mockResolvedValue({
    data: {
      agentsThreadDetail: {
        messages: [
          {
            ...user,
            parts: [
              {
                type: 'text',
                text: '[Page context] The user is viewing /settings/products.',
              },
              ...user.parts,
            ],
          },
          {
            id: 'stored-assistant',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Already saved reply' }],
          },
        ],
      },
    },
  });
  await act(async () => result.current.openThread('old'));
  expect(setMessages.mock.calls.at(-1)?.[0]).toEqual([
    expect.objectContaining({ id: 'sdk-user', role: 'user' }),
  ]);
  expect(resume).toHaveBeenCalledTimes(1);
});

describe('cached thread switching', () => {
  const storedMessage = (id: string, text: string) => ({
    __typename: 'AgentsMessage',
    id,
    role: 'assistant',
    createdAt: '2026-10-26T00:00:00.000Z',
    content: { parts: [{ type: 'text', text }] },
  });
  const storedDetail = (threadId: string, messages: unknown[]) => ({
    agentsThreadDetail: {
      __typename: 'AgentsThreadDetail',
      thread: {
        __typename: 'AgentsThread',
        id: threadId,
        title: threadId,
        createdAt: '2026-10-26T00:00:00.000Z',
        updatedAt: '2026-10-26T00:00:00.000Z',
      },
      messages,
    },
  });
  const cacheThread = (threadId: string, messages: unknown[]) =>
    mockApolloClient.cache.writeQuery({
      query: AGENTS_THREAD_DETAIL,
      variables: { threadId },
      data: storedDetail(threadId, messages),
    });
  const isCached = (threadId: string) =>
    mockApolloClient.cache.readQuery({
      query: AGENTS_THREAD_DETAIL,
      variables: { threadId },
    }) !== null;
  const network = () => {
    const requests = new Map<string, ReturnType<typeof deferred>>();
    load.mockImplementation(
      ({ variables }: { variables: { threadId: string } }) => {
        const request = deferred();
        requests.set(variables.threadId, request);
        return request.promise;
      },
    );
    return requests;
  };
  const finishRun = (isAbort = false) => {
    const options = (Chat as jest.Mock).mock.calls.at(-1)?.[0] as {
      onFinish: (input: unknown) => void;
    };
    options.onFinish({ message: { parts: [] }, isAbort, isDisconnect: false });
  };

  it('renders a cached transcript at once, without a loading state or waiting on the network', async () => {
    const cachedMessages = [storedMessage('m1', 'Cached reply')];
    cacheThread('a', cachedMessages);
    network();
    const loading: boolean[] = [];
    const { result } = renderHook(() => {
      const chat = useAgentsChat();
      loading.push(chat.loadingThread);
      return chat;
    });

    await act(async () => {
      await result.current.openThread('a');
    });

    expect(loading).not.toContain(true);
    expect(result.current.threadId).toBe('a');
    expect(setMessages).toHaveBeenCalledTimes(1);
    expect(setMessages.mock.calls[0][0]).toEqual(cachedMessages);
    // The background revalidation is still pending.
    expect(load).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: 'network-only' }),
    );
  });

  it('shows the loading state only when nothing is cached', async () => {
    const requests = network();
    const { result } = renderHook(() => useAgentsChat());
    let opening!: Promise<void>;
    await act(async () => {
      opening = result.current.openThread('a');
    });
    expect(result.current.loadingThread).toBe(true);
    await act(async () => {
      requests.get('a')?.resolve({
        data: storedDetail('a', [storedMessage('m1', 'Hi')]),
      });
      await opening;
    });
    expect(result.current.loadingThread).toBe(false);
  });

  it('replaces the transcript when the background refresh has newer messages', async () => {
    const cachedMessages = [storedMessage('m1', 'Cached reply')];
    const freshMessages = [
      ...cachedMessages,
      storedMessage('m2', 'Reply finished elsewhere'),
    ];
    cacheThread('a', cachedMessages);
    const requests = network();
    const { result } = renderHook(() => useAgentsChat());
    await act(async () => {
      await result.current.openThread('a');
    });
    await act(async () => {
      requests.get('a')?.resolve({ data: storedDetail('a', freshMessages) });
    });

    expect(setMessages).toHaveBeenCalledTimes(2);
    expect(setMessages.mock.calls[1][0]).toEqual(freshMessages);
  });

  it('keeps the transcript when the background refresh is unchanged', async () => {
    const cachedMessages = [storedMessage('m1', 'Cached reply')];
    cacheThread('a', cachedMessages);
    const requests = network();
    const { result } = renderHook(() => useAgentsChat());
    await act(async () => {
      await result.current.openThread('a');
    });
    await act(async () => {
      requests.get('a')?.resolve({ data: storedDetail('a', cachedMessages) });
    });

    expect(setMessages).toHaveBeenCalledTimes(1);
  });

  it('never overwrites a turn that started before the refresh landed', async () => {
    cacheThread('a', [storedMessage('m1', 'Cached reply')]);
    const requests = network();
    const { result } = renderHook(() => useAgentsChat());
    await act(async () => {
      await result.current.openThread('a');
    });
    act(() => mockSetActiveRunId('new-run'));
    await act(async () => {
      requests.get('a')?.resolve({
        data: storedDetail('a', [storedMessage('m2', 'Older server copy')]),
      });
    });

    expect(setMessages).toHaveBeenCalledTimes(1);
    // The new run makes the cached copy stale.
    expect(isCached('a')).toBe(false);
  });

  it('drops a refresh that lands after the user switched to another thread', async () => {
    cacheThread('a', [storedMessage('a1', 'A')]);
    cacheThread('b', [storedMessage('b1', 'B')]);
    const requests = network();
    const { result } = renderHook(() => useAgentsChat());
    await act(async () => {
      await result.current.openThread('a');
    });
    const refreshA = requests.get('a');
    await act(async () => {
      await result.current.openThread('b');
    });
    await act(async () => {
      refreshA?.resolve({
        data: storedDetail('a', [storedMessage('a2', 'Newer A')]),
      });
    });

    expect(result.current.threadId).toBe('b');
    expect(setMessages.mock.calls.map((call) => call[0][0].id)).toEqual([
      'a1',
      'b1',
    ]);
  });

  it('reads the network for a thread with a stored active run, even when cached', async () => {
    const resume = jest.fn(async () => undefined);
    (useChat as jest.Mock).mockReturnValue({
      messages: [],
      status: 'ready',
      sendMessage: noop,
      setMessages,
      clearError: noop,
      stop,
      addToolApprovalResponse: noop,
      resumeStream: resume,
      regenerate: noop,
    });
    cacheThread('a', [storedMessage('m1', 'Cached reply')]);
    sessionStorage.setItem('agents-active-run:a', 'live-run');
    const requests = network();
    const { result } = renderHook(() => useAgentsChat());
    let opening!: Promise<void>;
    await act(async () => {
      opening = result.current.openThread('a');
    });

    expect(result.current.loadingThread).toBe(true);
    expect(setMessages).not.toHaveBeenCalled();
    await act(async () => {
      requests.get('a')?.resolve({
        data: storedDetail('a', [
          // The mapper is mocked as identity: give the reconnect path parts.
          { ...storedMessage('m1', 'Cached reply'), parts: [] },
        ]),
      });
      await opening;
    });
    expect(result.current.loadingThread).toBe(false);
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('evicts the cached transcript when a turn completes', async () => {
    cacheThread('a', [storedMessage('m1', 'Cached reply')]);
    network();
    const { result } = renderHook(() => useAgentsChat());
    await act(async () => {
      await result.current.openThread('a');
    });
    expect(isCached('a')).toBe(true);

    act(() => finishRun());

    expect(isCached('a')).toBe(false);
  });
  // Leaving a thread re-reads it into the cache: covered against a real
  // Apollo client and server link in `threadDetailCache.test.tsx`.
});
