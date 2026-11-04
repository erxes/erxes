/** @jest-environment jsdom */
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
  gql,
} from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { randomUUID } from 'crypto';
import type { ReactNode } from 'react';

import { AGENTS_THREAD_DETAIL } from '../graphql/threads';
import { useAgentsChat } from '../hooks/useAgentsChat';

jest.mock('ai', () => ({
  isToolUIPart: () => false,
  lastAssistantMessageIsCompleteWithApprovalResponses: () => false,
}));
jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(),
  Chat: jest.fn(() => ({ stop: jest.fn() })),
}));
let mockSetActiveRunId: (runId: string | undefined) => void = () => undefined;
jest.mock('../transport', () => ({
  AgentsChatTransport: class {
    constructor(options: { onActiveRunId: (runId?: string) => void }) {
      mockSetActiveRunId = options.onActiveRunId;
    }
  },
}));
jest.mock('../hooks/useNavigationCatalog', () => ({
  useNavigationCatalog: () => [],
}));

import { Chat, useChat } from '@ai-sdk/react';

/** The ideal bound on cached transcripts (see `threadDetailCache.ts`). */
const MAX_CACHED_THREADS = 10;
const timestamp = '2026-10-26T00:00:00.000Z';

interface IStoredMessage {
  __typename: 'AgentsMessage';
  id: string;
  role: string;
  createdAt: string;
  content: { format: number; parts: { type: string; text: string }[] };
}

const storedMessage = (id: string, text: string): IStoredMessage => ({
  __typename: 'AgentsMessage',
  id,
  role: 'assistant',
  createdAt: timestamp,
  content: { format: 2, parts: [{ type: 'text', text }] },
});

const storedDetail = (threadId: string, messages: IStoredMessage[]) => ({
  agentsThreadDetail: {
    __typename: 'AgentsThreadDetail',
    thread: {
      __typename: 'AgentsThread',
      id: threadId,
      title: threadId,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    messages,
  },
});

/** A fake server behind a real Apollo client and normalized cache. */
const setupServer = () => {
  const threads = new Map<string, IStoredMessage[]>();
  const requests: string[] = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const threadId = String(operation.variables.threadId);
        requests.push(threadId);
        observer.next({
          data: storedDetail(threadId, threads.get(threadId) ?? []),
        });
        observer.complete();
      }),
  );
  const client = new ApolloClient({ cache: new InMemoryCache(), link });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return { client, threads, requests, wrapper };
};

const cachedMessageIds = (client: ApolloClient<object>, threadId: string) =>
  client.cache
    .readQuery<ReturnType<typeof storedDetail>>({
      query: AGENTS_THREAD_DETAIL,
      variables: { threadId },
    })
    ?.agentsThreadDetail.messages.map((message) => message.id) ?? null;

const finishRun = () => {
  const options = (Chat as jest.Mock).mock.calls.at(-1)?.[0] as {
    onFinish: (input: {
      message: { parts: never[] };
      isAbort: boolean;
      isDisconnect: boolean;
    }) => void;
  };
  options.onFinish({
    message: { parts: [] },
    isAbort: false,
    isDisconnect: false,
  });
};

beforeAll(() =>
  Object.defineProperty(crypto, 'randomUUID', {
    value: randomUUID,
    configurable: true,
  }),
);

beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
  (useChat as jest.Mock).mockReturnValue({
    messages: [],
    status: 'ready',
    sendMessage: jest.fn(),
    setMessages: jest.fn(),
    clearError: jest.fn(),
    stop: jest.fn(async () => undefined),
    addToolApprovalResponse: jest.fn(),
    resumeStream: jest.fn(async () => undefined),
    regenerate: jest.fn(),
  });
});

describe('thread detail cache', () => {
  const visitThreads = async (count: number) => {
    const server = setupServer();
    for (let index = 0; index < count; index += 1) {
      server.threads.set(`t${index}`, [
        storedMessage(`t${index}-m`, `Reply ${index}`),
      ]);
    }
    const hook = renderHook(() => useAgentsChat(), {
      wrapper: server.wrapper,
    });
    for (let index = 0; index < count; index += 1) {
      await act(async () => {
        await hook.result.current.openThread(`t${index}`);
      });
    }
    // Let background revalidations and prefetches settle.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    return { ...server, hook };
  };

  it('keeps only the most recently visited thread details, removing older ones entirely', async () => {
    const extra = 3;
    const { client } = await visitThreads(MAX_CACHED_THREADS + extra);
    const snapshot = client.cache.extract();

    for (let index = 0; index < extra; index += 1) {
      expect(cachedMessageIds(client, `t${index}`)).toBeNull();
      // The transcript's normalized messages are gone too, not just the
      // root field that pointed at them.
      expect(snapshot[`AgentsMessage:t${index}-m`]).toBeUndefined();
    }
    for (let index = extra; index < MAX_CACHED_THREADS + extra; index += 1) {
      expect(cachedMessageIds(client, `t${index}`)).toEqual([`t${index}-m`]);
    }
  });

  it('still restores a recently visited thread instantly', async () => {
    const { hook, requests } = await visitThreads(MAX_CACHED_THREADS + 2);
    const loading: boolean[] = [];
    hook.rerender();
    const before = requests.length;

    let opening!: Promise<void>;
    act(() => {
      opening = hook.result.current.openThread('t5');
      loading.push(hook.result.current.loadingThread);
    });
    loading.push(hook.result.current.loadingThread);
    await act(async () => {
      await opening;
    });

    expect(loading).not.toContain(true);
    expect(hook.result.current.threadId).toBe('t5');
    // Only the background revalidation went to the network.
    expect(requests.slice(before)).toEqual(['t5']);
  });

  it('evicts only its own entries when a run starts and finishes', async () => {
    const { client, threads, wrapper } = setupServer();
    threads.set('a', [storedMessage('a-m', 'Reply')]);
    // Another module's data: it dropped its root field (to refetch later)
    // but still reads the normalized customer by id. Only a global gc()
    // would remove it.
    client.cache.writeQuery({
      query: gql`
        query UnrelatedCustomerDetail {
          customerDetail(_id: "c1") {
            _id
            firstName
          }
        }
      `,
      data: {
        customerDetail: { __typename: 'Customer', _id: 'c1', firstName: 'Ann' },
      },
    });
    client.cache.evict({ fieldName: 'customerDetail' });
    const { result } = renderHook(() => useAgentsChat(), { wrapper });
    await act(async () => {
      await result.current.openThread('a');
    });
    expect(cachedMessageIds(client, 'a')).toEqual(['a-m']);

    act(() => mockSetActiveRunId('run-1'));
    act(() => finishRun());

    const snapshot = client.cache.extract();
    expect(snapshot['Customer:c1']).toEqual({
      __typename: 'Customer',
      _id: 'c1',
      firstName: 'Ann',
    });
    expect(snapshot['AgentsMessage:a-m']).toBeUndefined();
  });

  it("does not refetch the open thread behind the user's back when a run starts or finishes", async () => {
    const { requests, threads, wrapper } = setupServer();
    threads.set('a', [storedMessage('a-1', 'First')]);
    const { result } = renderHook(() => useAgentsChat(), { wrapper });
    await act(async () => {
      await result.current.openThread('a');
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const before = requests.length;

    act(() => mockSetActiveRunId('run-1'));
    act(() => finishRun());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(requests.slice(before)).toEqual([]);
  });

  it('re-reads a thread into the cache when the user leaves it', async () => {
    const { client, threads, wrapper } = setupServer();
    threads.set('a', [storedMessage('a-1', 'First')]);
    const { result } = renderHook(() => useAgentsChat(), { wrapper });
    await act(async () => {
      await result.current.openThread('a');
    });
    // A turn completes: the stored transcript grows and the stale copy goes.
    threads.set('a', [
      storedMessage('a-1', 'First'),
      storedMessage('a-2', 'Second'),
    ]);
    act(() => finishRun());
    expect(cachedMessageIds(client, 'a')).toBeNull();

    await act(async () => {
      await result.current.startNewConversation();
    });

    await waitFor(() =>
      expect(cachedMessageIds(client, 'a')).toEqual(['a-1', 'a-2']),
    );
  });

  it('does not re-read a thread that is still cached when the user leaves it', async () => {
    const { requests, threads, wrapper } = setupServer();
    threads.set('a', [storedMessage('a-1', 'First')]);
    const { result } = renderHook(() => useAgentsChat(), { wrapper });
    await act(async () => {
      await result.current.openThread('a');
    });
    const before = requests.length;

    await act(async () => {
      await result.current.startNewConversation();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(requests.slice(before)).toEqual([]);
  });
});
