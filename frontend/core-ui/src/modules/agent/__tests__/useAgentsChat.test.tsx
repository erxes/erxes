import { pageSelectionsPart } from '../pageSelections';
/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { APICallError, type UIMessageChunk } from 'ai';
import { randomUUID } from 'crypto';
import { useAgentsChat } from '../hooks/useAgentsChat';
import type { IAgentsRequestSelection } from '../transport';

jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(),
  useMutation: jest.fn(),
}));
const mockSendMessages = jest.fn();
const mockReconnectToStream = jest.fn();
let mockGetRequestSelection: () => IAgentsRequestSelection;
jest.mock('../transport', () => ({
  AgentsChatTransport: class {
    sendMessages = mockSendMessages;
    reconnectToStream = mockReconnectToStream;
    constructor(options: {
      getRequestSelection: () => IAgentsRequestSelection;
    }) {
      mockGetRequestSelection = options.getRequestSelection;
    }
  },
}));
jest.mock('../hooks/useNavigationCatalog', () => ({
  useNavigationCatalog: () => [],
}));

import { useLazyQuery, useMutation } from '@apollo/client';

const load = jest.fn();
const stopThread = jest.fn();

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const detail = (messages: unknown[]) => ({
  data: { agentsThreadDetail: { messages } },
});
const reply = (id: string) => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text: id }],
});

/** A response stream the test writes chunks into and closes. */
const controlledStream = () => {
  let controller!: ReadableStreamDefaultController<UIMessageChunk>;
  const stream = new ReadableStream<UIMessageChunk>({
    start(created) {
      controller = created;
    },
  });
  return { stream, controller };
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
  (useLazyQuery as jest.Mock).mockReturnValue([load]);
  (useMutation as jest.Mock).mockReturnValue([stopThread]);
  mockReconnectToStream.mockResolvedValue(null);
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

it('keeps the latest selected thread when an older request resolves last', async () => {
  const a = deferred<unknown>();
  const b = deferred<unknown>();
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
    b.resolve(detail([reply('b')]));
    await openB;
  });
  await act(async () => {
    a.resolve(detail([reply('a')]));
    await openA;
  });
  expect(result.current.threadId).toBe('b');
  expect(result.current.messages.map((message) => message.id)).toEqual(['b']);
  expect(sessionStorage.getItem('agents-selected-thread:panel')).toBe('b');
});

it('does not restore a pending thread after starting a new conversation', async () => {
  const pending = deferred<unknown>();
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
    pending.resolve(detail([reply('old')]));
    await opening;
  });
  expect(result.current.threadId).toBeUndefined();
  expect(result.current.messages).toEqual([]);
  expect(sessionStorage.getItem('agents-selected-thread:panel')).toBeNull();
});

it('reattaches to a running run when a thread opens', async () => {
  load.mockResolvedValue(detail([reply('old')]));
  const { result } = renderHook(() => useAgentsChat());
  await act(async () => result.current.openThread('old'));
  expect(mockReconnectToStream).toHaveBeenCalledWith(
    expect.objectContaining({ chatId: 'old' }),
  );
});

it('keeps a run streaming in the background while another thread is open', async () => {
  load.mockResolvedValue(detail([]));
  const { result } = renderHook(() => useAgentsChat());
  const running = controlledStream();
  mockSendMessages.mockResolvedValueOnce(running.stream);
  await act(async () => {
    void result.current.sendMessage({ text: 'Make a report' });
  });
  const first = result.current.threadId ?? '';
  expect(first).not.toBe('');
  expect(result.current.status).toBe('submitted');

  await act(async () => result.current.openThread('other'));
  expect(result.current.threadId).toBeUndefined();

  await act(async () => {
    running.controller.enqueue({ type: 'start', messageId: 'answer' });
    running.controller.enqueue({ type: 'text-start', id: 't' });
    running.controller.enqueue({ type: 'text-delta', id: 't', delta: 'Done' });
    running.controller.enqueue({ type: 'text-end', id: 't' });
  });
  load.mockClear();
  await act(async () => result.current.openThread(first));
  expect(load).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(result.current.messages.at(-1)?.parts).toContainEqual(
      expect.objectContaining({ type: 'text', text: 'Done' }),
    ),
  );
  await act(async () => {
    running.controller.enqueue({ type: 'finish' });
    running.controller.close();
  });
});

it('answers a suspended ask_user call by continuing the assistant message', async () => {
  load.mockResolvedValue(
    detail([
      { id: 'q', role: 'user', parts: [{ type: 'text', text: 'Report' }] },
      {
        id: 'ask',
        role: 'assistant',
        parts: [
          {
            type: 'data-tool-call-suspended',
            id: 'call-1',
            data: { runId: 'run-1', toolCallId: 'call-1', toolName: 'askUser' },
          },
        ],
      },
    ]),
  );
  mockSendMessages.mockResolvedValue(
    new ReadableStream({ start: (c) => c.close() }),
  );
  const { result } = renderHook(() => useAgentsChat());
  await act(async () => result.current.openThread('t'));
  await act(async () => result.current.submitAnswer(['Last month']));
  expect(mockSendMessages).toHaveBeenCalledWith(
    expect.objectContaining({
      chatId: 't',
      trigger: 'submit-message',
      messageId: 'ask',
      body: {
        resume: {
          runId: 'run-1',
          toolCallId: 'call-1',
          answers: ['Last month'],
        },
      },
    }),
  );
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

const openEditable = async (messages: unknown[] = editHistory) => {
  load.mockResolvedValue(detail(messages));
  const hook = renderHook(() => useAgentsChat());
  await act(async () => hook.result.current.openThread('t'));
  return hook;
};

it('uses SDK message replacement while retaining the original attachments and page context', async () => {
  mockSendMessages.mockResolvedValue(
    new ReadableStream({ start: (c) => c.close() }),
  );
  const { result } = await openEditable();
  await act(async () =>
    result.current.editMessage('edit-me', '  Revised prompt  '),
  );
  const request = mockSendMessages.mock.calls[0][0];
  expect(request.body).toEqual({
    editMessageId: 'edit-me',
    pageContext: { path: '/contacts' },
  });
  expect(request.messages.at(-1)).toEqual(
    expect.objectContaining({
      id: 'edit-me',
      parts: [
        editHistory[2].parts[2],
        { type: 'text', text: 'Revised prompt' },
      ],
    }),
  );
  expect(request.messages).toHaveLength(3);
});

it('restores the full transcript when the server rejects an edit', async () => {
  mockSendMessages.mockRejectedValue(
    new APICallError({
      message: 'Finish the current response first.',
      url: 'chat',
      requestBodyValues: undefined,
      statusCode: 409,
    }),
  );
  const { result } = await openEditable();
  await act(async () =>
    result.current.editMessage('edit-me', 'Revised prompt'),
  );
  await waitFor(() =>
    expect(result.current.messages.map((message) => message.id)).toEqual(
      editHistory.map((message) => message.id),
    ),
  );
});

it('does not edit assistant messages or interrupt a streaming response', async () => {
  const running = controlledStream();
  mockSendMessages.mockResolvedValueOnce(running.stream);
  const { result } = await openEditable();
  await act(async () => result.current.editMessage('reply', 'Revised prompt'));
  expect(mockSendMessages).not.toHaveBeenCalled();
  await act(async () => {
    void result.current.sendMessage({ text: 'Next' });
  });
  await act(async () =>
    result.current.editMessage('edit-me', 'Revised prompt'),
  );
  expect(mockSendMessages).toHaveBeenCalledTimes(1);
  await act(async () => running.controller.close());
});

it('retains typed page selections when editing a question', async () => {
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
  mockSendMessages.mockResolvedValue(
    new ReadableStream({ start: (c) => c.close() }),
  );
  const { result } = await openEditable([
    {
      id: 'selected',
      role: 'user',
      parts: [{ type: 'text', text: 'Question' }, selection],
    },
  ]);
  await act(async () => result.current.editMessage('selected', 'New question'));
  expect(mockSendMessages.mock.calls[0][0].messages.at(-1).parts).toEqual([
    selection,
    { type: 'text', text: 'New question' },
  ]);
});
