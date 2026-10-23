import { resolveAgentsReference } from '@/agents/referenceResolution';
/**
 * Route-level contract tests for the Agents HTTP surface.
 *
 * These drive the real Express router with requests shaped the way the
 * platform gateway actually sends them (base64 `user` header + `hostname`
 * header) and verify the invariants that matter most:
 *
 * - unauthenticated or malformed identities never reach the agent runtime;
 * - a client can never continue or read a thread owned by another user;
 * - only the newest client message is forwarded to the model;
 * - the acting user's identity is stamped from headers, never from the body;
 * - a finished turn (and its later generated title) publishes the per-user
 *   `agentsThreadsChanged` event so the sidebar refreshes without a manual
 *   reload.
 */

import { router } from '@/agents/routes';
import { isAgentsRunAlive } from '@/agents/runLiveness';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { Readable } from 'stream';
import { readFileFromStorage, readFileStreamFromStorage } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  readFileStreamFromStorage: jest.fn(),
  readFileFromStorage: jest.fn(),
  sanitizeKey: (key: string) => {
    if (!key) throw new Error('Key cannot be empty');
    if (/^https?:\/\//i.test(key)) {
      throw new Error('Invalid key: protocol scheme not allowed');
    }
    return key;
  },
  // Faithful copies of the platform implementations so the routes are
  // exercised with the gateway's real wire format instead of a stub.
  extractUserFromHeader: (headers: Record<string, unknown>) => {
    const raw = headers.user;
    if (!raw || Array.isArray(raw)) {
      return null;
    }
    return JSON.parse(Buffer.from(String(raw), 'base64').toString('utf-8'));
  },
  getSubdomain: (req: { headers: Record<string, unknown> }) =>
    String(req.headers.hostname ?? '')
      .replace(/(^\w+:|^)\/\//, '')
      .split('.')[0],
  ExpectedError: class ExpectedError extends Error {
    code?: string;
    constructor(message: string, code?: string) {
      super(message);
      this.code = code;
    }
  },
}));

jest.mock('erxes-api-shared/core-modules', () => ({
  checkPermissionGroup: jest.fn(() => async () => undefined),
}));

jest.mock('~/connectionResolvers', () => ({
  generateModels: jest.fn(),
}));
jest.mock('@/agents/referenceResolution', () => ({
  ...jest.requireActual('@/agents/referenceResolution'),
  resolveAgentsReference: jest.fn(),
}));
jest.mock('@/agents/agent', () => ({
  isAgentsThinkingLevel: (value: unknown) =>
    typeof value === 'string' &&
    ['off', 'minimal', 'low', 'medium', 'high'].includes(value),
  AGENTS_MAX_STEPS: 32,
  buildAgentsModelSettings: jest.fn(() => ({
    temperature: 0.2,
    maxOutputTokens: 2000,
  })),
}));
jest.mock('@/agents/runLiveness', () => ({ isAgentsRunAlive: jest.fn() }));
jest.mock('@/agents/memory', () => ({
  getAgentsMemory: jest.fn(),
  getAgentsRuntime: jest.fn(),
}));
jest.mock('@/agents/requestContext', () => ({
  buildAgentsRequestContext: jest.fn(
    async (values: { [key: string]: unknown }) => ({
      get(key: string): unknown {
        return values[key];
      },
    }),
  ),
}));
jest.mock('@/agents/threadsEvents', () => ({
  publishAgentsThreadsChanged: jest.fn(),
}));
jest.mock('ai', () => ({
  pipeUIMessageStreamToResponse: jest.fn(),
  isToolUIPart: (part: { type: string }) =>
    part.type.startsWith('tool-') || part.type === 'dynamic-tool',
}));
// The real MessageList pulls in all of @mastra/core; the route only needs it
// to turn the prompt into a storable message.
jest.mock('@mastra/core/agent', () => ({
  MessageList: class {
    private messages: unknown[] = [];
    add(message: unknown) {
      this.messages.push(message);
      return this;
    }
    get get() {
      return { all: { db: () => this.messages } };
    }
  },
}));
jest.mock('@mastra/ai-sdk', () => {
  const toAISdkStream = jest.fn();
  return {
    toAISdkStream,
    // Mirrors the real handler's dispatch: `resumeData` resumes the run, an
    // assistant message resumes its approval-responded call, and anything
    // else streams a new turn. The result goes through `toAISdkStream`.
    handleChatStream: jest.fn(async ({ mastra, agentId, params, onError }) => {
      const agent = mastra.getAgentById(agentId);
      const { messages, resumeData, ...options } = params;
      const decision = messages
        .at(-1)
        ?.parts?.find(
          (part: { state?: string }) => part.state === 'approval-responded',
        );
      const output = resumeData
        ? await agent.resumeStream(resumeData, options)
        : decision
          ? await agent.resumeStream(
              {
                approved: decision.approval.approved,
                ...(decision.approval.reason
                  ? { reason: decision.approval.reason }
                  : {}),
              },
              {
                ...options,
                runId: decision.approval.id.split('::')[0],
                toolCallId: decision.toolCallId,
              },
            )
          : (await agent.stream(messages, options)).output;
      return toAISdkStream(output, { from: 'agent', version: 'v7', onError });
    }),
  };
});

import { generateModels } from '~/connectionResolvers';
import { buildAgentsModelSettings } from '@/agents/agent';
import { getAgentsRuntime } from '@/agents/memory';
import { publishAgentsThreadsChanged } from '@/agents/threadsEvents';
import { buildAgentsRequestContext } from '@/agents/requestContext';
import type { IAgentsRequestContext } from '@/agents/requestContext';

// `ai` and `@mastra/ai-sdk` are ESM-only; the mocked modules are retrieved
// through jest.requireMock so this CommonJS test file never imports them.
const { pipeUIMessageStreamToResponse: mockedPipe } = jest.requireMock(
  'ai',
) as { pipeUIMessageStreamToResponse: jest.Mock };
const {
  toAISdkStream: mockedToAISdkStream,
  handleChatStream: mockedHandleChatStream,
} = jest.requireMock('@mastra/ai-sdk') as {
  toAISdkStream: jest.Mock;
  handleChatStream: jest.Mock;
};

const mockedGenerateModels = generateModels as jest.MockedFunction<
  typeof generateModels
>;
const mockedGetAgentsRuntime = getAgentsRuntime as jest.MockedFunction<
  typeof getAgentsRuntime
>;
const mockedBuildAgentsModelSettings =
  buildAgentsModelSettings as jest.MockedFunction<
    typeof buildAgentsModelSettings
  >;
const mockedBuildAgentsRequestContext =
  buildAgentsRequestContext as jest.MockedFunction<
    typeof buildAgentsRequestContext
  >;
const mockedPublishAgentsThreadsChanged =
  publishAgentsThreadsChanged as jest.MockedFunction<
    typeof publishAgentsThreadsChanged
  >;

interface IRouteLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: { handle: (req: unknown, res: unknown) => Promise<void> | void }[];
  };
}

const getHandler = (method: string, path: string) => {
  const layers = (router as unknown as { stack: IRouteLayer[] }).stack;
  for (const layer of layers) {
    if (layer.route?.path === path && layer.route.methods[method]) {
      const handle = layer.route.stack[0]?.handle;
      if (handle) {
        return handle;
      }
    }
  }
  throw new Error(`No route registered for ${method.toUpperCase()} ${path}`);
};

const chatHandler = getHandler('post', '/agents/chat');
const streamHandler = getHandler('get', '/agents/chat/:threadId/stream');

interface IFakeResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  headersSent: boolean;
  writableEnded: boolean;
  status(code: number): IFakeResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
  end(): void;
}

const buildRes = (): IFakeResponse => {
  const res: IFakeResponse = {
    statusCode: 200,
    body: undefined,
    headers: {},
    headersSent: false,
    writableEnded: false,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
      // Like Express: once any header is written, the headers are sent.
      res.headersSent = true;
    },
    end() {
      res.writableEnded = true;
    },
  };
  return res;
};

interface IReqOptions {
  user?: Record<string, unknown>;
  hostname?: string;
  body?: unknown;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

const buildReq = (options: IReqOptions = {}) => {
  const headers: Record<string, string> = {
    hostname: options.hostname ?? 'tenant.example.com',
  };
  if (options.user) {
    headers.user = Buffer.from(JSON.stringify(options.user), 'utf-8').toString(
      'base64',
    );
  }
  // The AI SDK client always sends its Chat id as the thread id.
  const requestBody =
    options.body &&
    typeof options.body === 'object' &&
    'messages' in options.body &&
    !('threadId' in options.body)
      ? { threadId: 'thread-1', ...options.body }
      : options.body;
  return {
    headers,
    body: requestBody ?? {},
    query: options.query ?? {},
    params: options.params ?? {},
  };
};

const ACTING_USER = { _id: 'user-1', email: 'agent@example.com' };

const CONNECTION_DOC = {
  userId: 'user-1',
  connections: [
    {
      provider: 'openai',
      model: 'gpt-5.6-luna',
      config: { apiKey: 'sk-test' },
    },
  ],
};

const connectionModel = {
  getConnections: jest.fn(),
  upsertConnection: jest.fn(),
  removeConnection: jest.fn(),
};

const settingsModel = {
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
};

const userMessage = (text: string) => ({
  id: `m-${text}`,
  role: 'user',
  content: [{ type: 'text', text }],
});

interface IMemoryFake {
  createThread: jest.Mock;
  getThreadById: jest.Mock;
  listThreads: jest.Mock;
  recall: jest.Mock;
  saveMessages: jest.Mock;
  deleteMessages: jest.Mock;
}

const threadPage = (
  threads: unknown[],
  extra: Record<string, unknown> = {},
) => ({
  threads,
  total: threads.length,
  page: 0,
  perPage: 20,
  hasMore: false,
  ...extra,
});

const messagePage = (
  messages: unknown[],
  thread: unknown,
  extra: Record<string, unknown> = {},
) => ({
  thread,
  messages,
  total: messages.length,
  page: 0,
  perPage: 20,
  hasMore: false,
  ...extra,
});

const buildMemory = (): IMemoryFake => ({
  createThread: jest.fn(async ({ threadId, resourceId }) => ({id:threadId,resourceId})),
  getThreadById: jest.fn(async () => null),
  listThreads: jest.fn(async () => threadPage([])),
  recall: jest.fn(async () => messagePage([], null)),
  saveMessages: jest.fn(async ({ messages }) => ({ messages })),
  deleteMessages: jest.fn(async () => undefined),
});

interface IStreamOptions {
  runId?: string;
  maxSteps?: number;
  memory?: {
    thread: string;
    resource: string;
    onTitleGenerated?: () => void;
  };
  onFinish?: () => void;
  closeOnSuspend?: boolean;
  requestContext?: { get(key: string): unknown };
}

// DurableAgent.stream() returns { output, runId, cleanup }.
// output is a MastraModelOutput that toAISdkStream accepts.
const OUTPUT_SENTINEL = { sentinel: 'mastra-output' };

const streamMock = jest.fn<
  Promise<{ output: unknown; runId: string; cleanup: () => void }>,
  [unknown[], IStreamOptions]
>(async (_messages, options) => ({
  output: OUTPUT_SENTINEL,
  runId: options?.runId ?? 'generated-run-id',
  cleanup: jest.fn(),
}));

interface ISuspendedRun {
  runId: string;
  toolCalls?: {
    toolCallId?: string;
    toolName?: string;
    requiresApproval: boolean;
    suspendPayload?: unknown;
  }[];
}

const listSuspendedRunsMock = jest.fn<
  Promise<{ runs: ISuspendedRun[]; total: number }>,
  [{ threadId?: string; resourceId?: string }?]
>(async () => ({ runs: [], total: 0 }));

interface IResumeOptions {
  runId?: string;
  toolCallId?: string;
  maxSteps?: number;
  memory?: {
    thread: string;
    resource: string;
    onTitleGenerated?: () => void;
  };
  onFinish?: () => void;
  closeOnSuspend?: boolean;
  requestContext?: { get(key: string): unknown };
}

const RESUMED_OUTPUT_SENTINEL = { sentinel: 'resumed-output' };

const resumeStreamMock = jest.fn<Promise<unknown>, [unknown, IResumeOptions]>(
  async () => RESUMED_OUTPUT_SENTINEL,
);

const listActiveRunsMock = jest.fn<
  Promise<{ runs: { runId: string; status: string }[]; total: number }>,
  [{ threadId?: string; resourceId?: string }?]
>(async () => ({ runs: [], total: 0 }));

const OBSERVED_OUTPUT_SENTINEL = { sentinel: 'observed-output' };

interface IObserveOptions {
  idleTimeoutMs?: number;
  isAlive?: () => Promise<boolean>;
  onSuspended?: () => void;
}

const observeMock = jest.fn<
  Promise<{ output: unknown; runId: string; cleanup: () => void }>,
  [string, IObserveOptions?]
>(async (runId) => ({
  output: OBSERVED_OUTPUT_SENTINEL,
  runId,
  cleanup: jest.fn(),
}));

let memory: IMemoryFake;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(checkPermissionGroup).mockImplementation(() => async () => undefined);
  jest.mocked(isAgentsRunAlive).mockResolvedValue(true);
  // Restore default implementations that mockResolvedValue overrides.
  listSuspendedRunsMock.mockImplementation(async () => ({
    runs: [],
    total: 0,
  }));
  listActiveRunsMock.mockImplementation(async () => ({ runs: [], total: 0 }));
  streamMock.mockImplementation(async (_messages, options) => ({
    output: OUTPUT_SENTINEL,
    runId: options?.runId ?? 'generated-run-id',
    cleanup: jest.fn(),
  }));
  resumeStreamMock.mockImplementation(async () => RESUMED_OUTPUT_SENTINEL);
  observeMock.mockImplementation(async (runId: string) => ({
    output: OBSERVED_OUTPUT_SENTINEL,
    runId,
    cleanup: jest.fn(),
  }));
  memory = buildMemory();
  mockedGenerateModels.mockResolvedValue({
    AgentsConnection: connectionModel,
    AgentsSettings: settingsModel,
  } as unknown as Awaited<ReturnType<typeof generateModels>>);
  connectionModel.getConnections.mockResolvedValue(CONNECTION_DOC);
  settingsModel.getSettings.mockResolvedValue({
    codeModeEnabled: false,
    codeModeEnvironment: 'in-process',
  });
  const agent = {
    id: 'agents',
    stream: streamMock,
    listSuspendedRuns: listSuspendedRunsMock,
    resumeStream: resumeStreamMock,
    listActiveRuns: listActiveRunsMock,
    observe: observeMock,
  };
  mockedGetAgentsRuntime.mockResolvedValue({
    memory,
    mastra: { getAgentById: (id: string) => (id === 'agents' ? agent : null) },
    agent,
  } as unknown as Awaited<ReturnType<typeof getAgentsRuntime>>);
  mockedBuildAgentsRequestContext.mockImplementation(
    async (values: IAgentsRequestContext) =>
      ({
        get(key: string): unknown {
          return values[key as keyof IAgentsRequestContext];
        },
      }) as unknown as Awaited<ReturnType<typeof buildAgentsRequestContext>>,
  );
  mockedToAISdkStream.mockImplementation((stream: unknown) => ({
    wrapped: stream,
  }));
});

const body = (res: IFakeResponse) =>
  res.body as {
    error?: string;
    threads?: unknown[];
    thread?: unknown;
    messages?: unknown[];
  };

describe('POST /agents/chat — authentication and validation', () => {
  it('rejects unauthenticated requests before touching the agent runtime', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(res.statusCode).toBe(401);
    expect(body(res).error).toBe('Authentication required');
    expect(streamMock).not.toHaveBeenCalled();
    expect(streamMock).not.toHaveBeenCalled();
    expect(mockedPipe).not.toHaveBeenCalled();
  });

  it('rejects a user header that does not carry a user id', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: { email: 'no-id@example.com' },
        body: { messages: [userMessage('hi')] },
      }),
      res,
    );

    expect(res.statusCode).toBe(401);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('rejects a request without messages', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [] } }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('requires the client Chat id as the thread id', async () => {
    for (const threadId of [undefined, '   ', 42]) {
      const res = buildRes();
      await chatHandler(
        buildReq({
          user: ACTING_USER,
          body: { messages: [userMessage('hi')], threadId },
        }),
        res,
      );
      expect(res.statusCode).toBe(400);
    }
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('rejects a newest message that is neither user nor assistant', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [{ id: 's1', role: 'system', parts: [] }],
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe(
      'The newest message must be from the user or the assistant.',
    );
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('asks for an API key when the acting user has no stored connection', async () => {
    connectionModel.getConnections.mockResolvedValue(null);
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe('Add your API key to start using Agents.');
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('maps unexpected runtime failures to a JSON 500 instead of crashing', async () => {
    streamMock.mockRejectedValueOnce(new Error('model exploded'));
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(res.statusCode).toBe(500);
    expect(body(res).error).toBe('model exploded');
    expect(mockedPipe).not.toHaveBeenCalled();
  });
});

describe('POST /agents/chat — editing an earlier turn', () => {
  const request = {
    messages: [userMessage('revised')],
    threadId: 'own-thread',
    editMessageId: 'm-revised',
  };

  it('rejects malformed targets before changing storage', async () => {
    for (const invalid of [42, '', 'different-message']) {
      const res = buildRes();
      await chatHandler(
        buildReq({
          user: ACTING_USER,
          body: { ...request, editMessageId: invalid },
        }),
        res,
      );
      expect(res.statusCode).toBe(400);
    }
    expect(memory.deleteMessages).not.toHaveBeenCalled();
  });

  it('checks ownership before reading or deleting any messages', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-other' });
    const res = buildRes();
    await chatHandler(buildReq({ user: ACTING_USER, body: request }), res);
    expect(res.statusCode).toBe(403);
    expect(memory.recall).not.toHaveBeenCalled();
    expect(memory.deleteMessages).not.toHaveBeenCalled();
  });

  it('rewinds stored history before streaming the edited prompt into the same thread', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    memory.recall.mockResolvedValue(
      messagePage(
        [
          { id: 'earlier', role: 'user' },
          { id: 'm-revised', role: 'user' },
          { id: 'old-reply', role: 'assistant' },
        ],
        null,
      ),
    );
    const res = buildRes();
    await chatHandler(buildReq({ user: ACTING_USER, body: request }), res);
    expect(res.statusCode).toBe(200);
    expect(memory.deleteMessages).toHaveBeenCalledWith([
      'm-revised',
      'old-reply',
    ]);
    expect(streamMock).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'm-revised' })],
      expect.objectContaining({
        memory: expect.objectContaining({ thread: 'own-thread' }),
      }),
    );
  });

  it('returns a conflict when the thread is waiting for an answer', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [{ runId: 'pending' }],
      total: 1,
    });
    const res = buildRes();
    await chatHandler(buildReq({ user: ACTING_USER, body: request }), res);
    expect(res.statusCode).toBe(409);
    expect(memory.deleteMessages).not.toHaveBeenCalled();
    expect(streamMock).not.toHaveBeenCalled();
  });
});

describe('POST /agents/chat — thread ownership and isolation', () => {
  it('refuses to continue a thread owned by another user', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-other' });
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], threadId: 'stolen-thread' },
      }),
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(body(res).error).toBe('Thread belongs to another user.');
    expect(streamMock).not.toHaveBeenCalled();
    expect(streamMock).not.toHaveBeenCalled();
    expect(mockedPipe).not.toHaveBeenCalled();
  });

  it('streams into the client-supplied thread when the acting user owns it', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], threadId: 'own-thread' },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    // The durable agent's stream is called with the request context
    // carrying the resolved selection.
    expect(streamMock).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'm-hi' })],
      expect.objectContaining({
        memory: expect.objectContaining({
          thread: 'own-thread',
          resource: 'user-1',
        }),
      }),
    );
  });

  it('starts a new thread under the client-supplied id', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], threadId: 'new-thread' },
      }),
      res,
    );

    expect(memory.createThread).toHaveBeenCalledWith({
      threadId: 'new-thread',
      resourceId: 'user-1',
    });
    expect(streamMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        memory: expect.objectContaining({
          thread: 'new-thread',
          resource: 'user-1',
        }),
      }),
    );
  });
});

describe('POST /agents/chat — model input and identity', () => {
  it('forwards only the newest client message, never the client transcript', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [
            userMessage('first'),
            userMessage('second'),
            userMessage('third'),
          ],
        },
      }),
      res,
    );

    expect(streamMock).toHaveBeenCalledTimes(1);
    const forwarded = streamMock.mock.calls[0][0];
    expect(forwarded).toEqual([expect.objectContaining({ id: 'm-third' })]);
  });

  it('stamps the acting identity into the tool request context, ignoring the body', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        hostname: 'tenant.example.com',
        body: { messages: [userMessage('hi')] },
      }),
      res,
    );

    const options = streamMock.mock.calls[0][1];
    expect(options.requestContext?.get('subdomain')).toBe('tenant');
    expect(options.requestContext?.get('userId')).toBe('user-1');
  });

  it('publishes after native thread creation, before generation, and again for completion and title', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(res.statusCode).toBe(200);

    expect(memory.createThread).toHaveBeenCalledWith({threadId: expect.any(String), resourceId: 'user-1'});
    expect(memory.createThread.mock.invocationCallOrder[0]).toBeLessThan(streamMock.mock.invocationCallOrder[0]);
    expect(mockedPublishAgentsThreadsChanged).toHaveBeenCalledTimes(1);
    expect(mockedPublishAgentsThreadsChanged.mock.invocationCallOrder[0]).toBeLessThan(streamMock.mock.invocationCallOrder[0]);

    const options = streamMock.mock.calls[0][1];

    // Mastra fires onFinish after the run's messages are persisted…
    options.onFinish?.();
    expect(mockedPublishAgentsThreadsChanged).toHaveBeenCalledWith('user-1');

    // …and memory.onTitleGenerated later, once the async title is stored.
    options.memory?.onTitleGenerated?.();
    expect(mockedPublishAgentsThreadsChanged).toHaveBeenCalledTimes(3);
  });

  it('pipes the Mastra stream through the AI SDK adapter to the response', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(mockedHandleChatStream).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: 'agents', version: 'v7' }),
    );

    expect(mockedToAISdkStream).toHaveBeenCalledWith(
      OUTPUT_SENTINEL,
      expect.objectContaining({ version: 'v7' }),
    );
    expect(mockedPipe).toHaveBeenCalledWith(
      expect.objectContaining({
        response: res,
        stream: { wrapped: OUTPUT_SENTINEL },
      }),
    );
  });

  it('forwards provider error text from serialized and native onError shapes', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    const onError = mockedToAISdkStream.mock.calls[0][1].onError as (
      error: unknown,
    ) => string;

    // @mastra/ai-sdk serializes provider errors into plain objects.
    expect(
      onError({
        name: 'AI_APICallError',
        message: 'invalid temperature: only 1 is allowed for this model',
        stack: '',
      }),
    ).toBe('invalid temperature: only 1 is allowed for this model');
    expect(onError(new Error('  rate limited  '))).toBe('rate limited');
    expect(onError({})).toBe('The model failed to generate a response.');
    expect(onError(undefined)).toBe(
      'The model failed to generate a response.',
    );
  });

  it('passes modelSettings from buildAgentsModelSettings to the durable stream', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(mockedBuildAgentsModelSettings).toHaveBeenCalledWith(
      'openai',
      'off',
    );
    expect(streamMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        modelSettings: { temperature: 0.2, maxOutputTokens: 2000 },
      }),
    );
  });

  it('closes the response at a suspension once its snapshot is saved', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    expect(streamMock.mock.calls[0][1].closeOnSuspend).toBe(true);
  });

  it('rejects non-string provider/model overrides with 400 instead of crashing', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [userMessage('hi')],
          provider: 42,
          model: { id: 'x' },
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
  });

});

describe('POST /agents/chat — resuming a suspended run', () => {
  const approvalRun: ISuspendedRun = {
    runId: 'run-1',
    toolCalls: [
      { toolCallId: 'call-1', toolName: 'callGraphql', requiresApproval: true },
    ],
  };
  const askRun: ISuspendedRun = {
    runId: 'run-ask',
    toolCalls: [
      { toolCallId: 'ask-1', toolName: 'askUser', requiresApproval: false },
    ],
  };
  const decided = (
    approved: boolean,
    { runId = 'run-1', toolCallId = 'call-1', reason = '' } = {},
  ) => ({
    id: 'assistant-1',
    role: 'assistant',
    parts: [
      {
        type: 'tool-callGraphql',
        toolCallId,
        state: 'approval-responded',
        input: { query: 'mutation Remove' },
        approval: {
          id: `${runId}::${toolCallId}`,
          approved,
          ...(reason ? { reason } : {}),
        },
      },
    ],
  });
  const asked = { id: 'assistant-1', role: 'assistant', parts: [] };
  const resume = (body: Record<string, unknown>) =>
    buildReq({ user: ACTING_USER, body: { threadId: 't1', ...body } });

  beforeEach(() => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [approvalRun, askRun],
      total: 2,
    });
  });

  it('approves the decided call and streams the continuation', async () => {
    const res = buildRes();
    await chatHandler(resume({ messages: [decided(true)] }), res);

    expect(res.statusCode).toBe(200);
    expect(listSuspendedRunsMock).toHaveBeenCalledWith({
      threadId: 't1',
      resourceId: 'user-1',
    });
    expect(resumeStreamMock).toHaveBeenCalledWith(
      { approved: true },
      expect.objectContaining({
        runId: 'run-1',
        toolCallId: 'call-1',
        closeOnSuspend: true,
        memory: expect.objectContaining({ thread: 't1', resource: 'user-1' }),
      }),
    );
    expect(mockedPipe).toHaveBeenCalledWith(
      expect.objectContaining({ stream: { wrapped: RESUMED_OUTPUT_SENTINEL } }),
    );
    // Resumes keep the run's RequestContext snapshot.
    expect(mockedBuildAgentsRequestContext).not.toHaveBeenCalled();
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('declines with the user reason instead of executing the call', async () => {
    const res = buildRes();
    await chatHandler(
      resume({ messages: [decided(false, { reason: 'Wrong deal' })] }),
      res,
    );

    expect(resumeStreamMock).toHaveBeenCalledWith(
      { approved: false, reason: 'Wrong deal' },
      expect.objectContaining({ runId: 'run-1', toolCallId: 'call-1' }),
    );
  });

  it('answers ask_user with the structured answers', async () => {
    const res = buildRes();
    await chatHandler(
      resume({
        messages: [asked],
        resume: {
          runId: 'run-ask',
          toolCallId: 'ask-1',
          answers: ['Last month', ['Sales', 'Support']],
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(resumeStreamMock).toHaveBeenCalledWith(
      { answers: ['Last month', ['Sales', 'Support']] },
      expect.objectContaining({
        runId: 'run-ask',
        toolCallId: 'ask-1',
        closeOnSuspend: true,
      }),
    );
  });

  it('404s for an unknown thread and 403s for a foreign one', async () => {
    memory.getThreadById.mockResolvedValueOnce(null);
    const missing = buildRes();
    await chatHandler(resume({ messages: [decided(true)] }), missing);
    expect(missing.statusCode).toBe(404);

    memory.getThreadById.mockResolvedValueOnce({ resourceId: 'user-other' });
    const foreign = buildRes();
    await chatHandler(resume({ messages: [decided(true)] }), foreign);
    expect(foreign.statusCode).toBe(403);

    expect(listSuspendedRunsMock).not.toHaveBeenCalled();
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('409s for a call that is not suspended in this thread', async () => {
    for (const message of [
      decided(true, { runId: 'other-run' }),
      decided(true, { toolCallId: 'stale-call' }),
    ]) {
      const res = buildRes();
      await chatHandler(resume({ messages: [message] }), res);
      expect(res.statusCode).toBe(409);
    }
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('never answers an approval gate with ask_user data, or approves a question', async () => {
    const answered = buildRes();
    await chatHandler(
      resume({
        messages: [asked],
        resume: { runId: 'run-1', toolCallId: 'call-1', answers: ['Yes'] },
      }),
      answered,
    );
    expect(answered.statusCode).toBe(409);

    const approved = buildRes();
    await chatHandler(
      resume({
        messages: [decided(true, { runId: 'run-ask', toolCallId: 'ask-1' })],
      }),
      approved,
    );
    expect(approved.statusCode).toBe(409);
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('400s for an assistant message with nothing to resume or a malformed answer', async () => {
    const empty = buildRes();
    await chatHandler(resume({ messages: [asked] }), empty);
    expect(empty.statusCode).toBe(400);

    for (const answers of [[], [''], 'Yes']) {
      const res = buildRes();
      await chatHandler(
        resume({
          messages: [asked],
          resume: { runId: 'run-ask', toolCallId: 'ask-1', answers },
        }),
        res,
      );
      expect(res.statusCode).toBe(400);
    }
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('maps unexpected resume failures to a JSON 500 instead of crashing', async () => {
    resumeStreamMock.mockRejectedValueOnce(new Error('store down'));
    const res = buildRes();
    await chatHandler(resume({ messages: [decided(true)] }), res);

    expect(res.statusCode).toBe(500);
    expect(body(res).error).toBe('store down');
  });
});

describe('code mode flag resolved from tenant settings', () => {
  const enableCodeMode = () =>
    settingsModel.getSettings.mockResolvedValue({
      codeModeEnabled: true,
      codeModeEnvironment: 'in-process',
    });

  it('stamps codeModeEnabled into the request context when the tenant enables code mode', async () => {
    enableCodeMode();
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('compute this in code')] },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    // The code mode flag is stamped into the RequestContext so the
    // durable agent's dynamic instructions include code mode.
    expect(mockedBuildAgentsRequestContext).toHaveBeenCalledWith(
      expect.objectContaining({ codeModeEnabled: true }),
    );
  });

  it('stamps the tenant approvalMode into the request context', async () => {
    settingsModel.getSettings.mockResolvedValue({
      codeModeEnabled: false,
      codeModeEnvironment: 'in-process',
      approvalMode: 'destructive',
    });
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('update a deal')] },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(mockedBuildAgentsRequestContext).toHaveBeenCalledWith(
      expect.objectContaining({ approvalMode: 'destructive' }),
    );
  });

  it('stamps approvalMode writes when the stored settings lack the field', async () => {
    settingsModel.getSettings.mockResolvedValue({
      codeModeEnabled: false,
      codeModeEnvironment: 'in-process',
    });
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hello')] },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(mockedBuildAgentsRequestContext).toHaveBeenCalledWith(
      expect.objectContaining({ approvalMode: 'writes' }),
    );
  });

  it('stamps codeModeEnabled false when the flag is off (default)', async () => {
    // beforeEach already mocks codeModeEnabled: false.
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hello')] },
      }),
      res,
    );

    expect(mockedBuildAgentsRequestContext).toHaveBeenCalledWith(
      expect.objectContaining({ codeModeEnabled: false }),
    );
  });
});

describe('GET /agents/chat/:threadId/stream', () => {
  it('rejects unauthenticated requests', async () => {
    const res = buildRes();
    await streamHandler(
      buildReq({ params: { threadId: 't1' } }),
      res,
    );

    expect(res.statusCode).toBe(401);
  });

  it('returns 204 when the run is not active', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listActiveRunsMock.mockResolvedValue({ runs: [], total: 0 });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    expect(res.statusCode).toBe(204);
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('observes the thread\'s running run and pipes its output', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(observeMock).toHaveBeenCalledWith(
      targetRunId,
      expect.objectContaining({
        idleTimeoutMs: 60_000,
        onSuspended: expect.any(Function),
      }),
    );
    expect(mockedToAISdkStream).toHaveBeenCalledWith(
      OBSERVED_OUTPUT_SENTINEL,
      expect.objectContaining({ version: 'v7' }),
    );
  });

  it('ends the response on suspension during reconnect observe', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    // Capture the onSuspended callback passed to observe.
    const observeOptions = observeMock.mock.calls[0][1];
    expect(observeOptions?.onSuspended).toBeDefined();

    expect(res.writableEnded).toBe(false);
    observeOptions?.onSuspended?.();
    expect(res.writableEnded).toBe(true);
  });

  it("refuses to observe a run in another user's thread", async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-other' });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('passes a run-liveness probe that re-arms the idle timer while the run is alive', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    const observeOptions = observeMock.mock.calls[0][1];
    expect(observeOptions?.isAlive).toBeDefined();

    // Still executing: the idle timer must re-arm instead of closing.
    await expect(observeOptions?.isAlive?.()).resolves.toBe(true);
  });

  it('keeps the reconnect alive while the run is parked at an HITL gate', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    // By the time the idle probe fires the run has suspended: alive.
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    const observeOptions = observeMock.mock.calls[0][1];

    listActiveRunsMock.mockResolvedValue({ runs: [], total: 0 });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId }],
      total: 1,
    });

    await expect(observeOptions?.isAlive?.()).resolves.toBe(true);
  });

  it('ends the reconnect wait when the run is neither active nor suspended', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    const observeOptions = observeMock.mock.calls[0][1];

    jest.mocked(isAgentsRunAlive).mockResolvedValue(false);

    await expect(observeOptions?.isAlive?.()).resolves.toBe(false);
  });

  it('lets discovery errors propagate so Mastra treats the run as alive', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    const observeOptions = observeMock.mock.calls[0][1];

    // Mastra catches isAlive throws as "still alive", so a momentary store
    // failure must never resolve the probe to false here.
    jest.mocked(isAgentsRunAlive).mockRejectedValue(new Error('store unavailable'));

    await expect(observeOptions?.isAlive?.()).rejects.toThrow(
      'store unavailable',
    );
  });

  it('ends the stream instead of crashing when piping fails after headers were sent', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    // The real pipe writes the SSE headers before pumping the stream.
    mockedPipe.mockImplementationOnce(
      ({ response }: { response: IFakeResponse }) => {
        response.setHeader('Content-Type', 'text/event-stream');
        throw new Error('late stream failure');
      },
    );
    const res = buildRes();
    await streamHandler(
      buildReq({
        user: ACTING_USER,
        params: { threadId: 't1' },
      }),
      res,
    );

    // The pipe sent the SSE headers before the pump failed, so the
    // shared error helper must end the stream rather than write a JSON
    // error (which throws ERR_HTTP_HEADERS_SENT and crashes the process).
    expect(res.headersSent).toBe(true);
    expect(res.writableEnded).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeUndefined();
  });
});

describe('POST /agents/chat — file attachments', () => {
  const csv = 'name,price\nTea,12\n';
  const attachment = {
    name: 'products.csv',
    url: 'private-products.csv',
    type: 'text/csv',
    size: Buffer.byteLength(csv),
  };
  const fileUserMessage = (files: unknown[]) => ({
    id: 'm-files',
    role: 'user',
    parts: [
      { type: 'text', text: 'see this' },
      { type: 'data-agents-files', data: { files } },
    ],
  });

  it('rejects leftover fileIds payloads', async () => {
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: { fileIds: ['64b0c0c0c0c0c0c0c0c0c0c0'], messages: [userMessage('hello')] },
    }), res);
    expect(res.statusCode).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('rejects native file parts that the model runtime would fetch', async () => {
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: {
        messages: [{
          id: 'm-url',
          role: 'user',
          content: [{ type: 'file', data: 'http://127.0.0.1/secret.txt', mediaType: 'text/plain' }],
        }],
      },
    }), res);
    expect(res.statusCode).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('supplies storage-key CSV bytes and ignores forged client content', async () => {
    jest.mocked(readFileStreamFromStorage).mockResolvedValue(Readable.from([Buffer.from(csv)]));
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: { messages: [fileUserMessage([{ ...attachment, text: 'forged content' }])] },
    }), res);
    expect(streamMock).toHaveBeenCalled();
    expect(readFileStreamFromStorage).toHaveBeenCalledWith({
      subdomain: 'tenant',
      key: attachment.url,
    });
    const serialized = JSON.stringify(streamMock.mock.calls[0][0]);
    expect(serialized).toContain('Tea,12');
    expect(serialized).not.toContain('forged');
  });

  it('supplies server-read image bytes before starting the model', async () => {
    const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');
    jest.mocked(readFileStreamFromStorage).mockResolvedValue(Readable.from([png]));
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: {
        messages: [fileUserMessage([{
          name: 'shot.png',
          url: 'shot.png',
          type: 'image/png',
          size: 12,
        }])],
      },
    }), res);
    expect(streamMock).toHaveBeenCalled();
    expect(JSON.stringify(streamMock.mock.calls[0][0])).toContain(`data:image/png;base64,${png.toString('base64')}`);
    expect(readFileStreamFromStorage).toHaveBeenCalledWith({ subdomain: 'tenant', key: 'shot.png' });
  });

  it('streams chat with a Cloudflare Images attachment even when the R2 key is absent', async () => {
    const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');
    jest.mocked(readFileStreamFromStorage).mockRejectedValue(new Error('NoSuchKey'));
    jest.mocked(readFileFromStorage).mockResolvedValue(png);
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: { messages: [fileUserMessage([{
        name: 'shot.png', url: 'bucket/shot.png', type: 'image/png', size: png.length,
      }])] },
    }), res);
    expect(res.statusCode).toBe(200);
    expect(streamMock).toHaveBeenCalled();
    expect(JSON.stringify(streamMock.mock.calls[0][0])).toContain(`data:image/png;base64,${png.toString('base64')}`);
    expect(readFileFromStorage).toHaveBeenCalledWith({ subdomain: 'tenant', key: 'bucket/shot.png' });
  });

  it('refuses private image URLs before starting the model', async () => {
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: { messages: [fileUserMessage([{
        name: 'shot.png', url: 'http://127.0.0.1/shot.png', type: 'image/png', size: 12,
      }])] },
    }), res);
    expect(res.statusCode).toBe(502);
    expect(streamMock).not.toHaveBeenCalled();
    expect(readFileStreamFromStorage).not.toHaveBeenCalled();
  });

  it('fails before streaming when text extraction fails', async () => {
    jest.mocked(readFileStreamFromStorage).mockRejectedValue(new Error('secret/key credentials'));
    const res = buildRes();
    await chatHandler(buildReq({
      user: ACTING_USER,
      body: { messages: [fileUserMessage([attachment])] },
    }), res);
    expect(res.statusCode).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('secret/key');
    expect(streamMock).not.toHaveBeenCalled();
  });
});

describe('POST /agents/chat — page context', () => {
  const partsUserMessage = (text: string) => ({
    id: `m-${text}`,
    role: 'user',
    parts: [{ type: 'text', text }],
  });

  const firstSentPartText = (): string | undefined => {
    const messages = streamMock.mock.calls[0][0] as {
      parts?: { type: string; text?: string }[];
    }[];

    return messages[0]?.parts?.[0]?.text;
  };

  it('prepends a delimited context part to the model input when pageContext is valid', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          pageContext: { path: '/sales/deals' },
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(streamMock).toHaveBeenCalled();
    expect(firstSentPartText()).toBe(
      '[Page context] The user is viewing /sales/deals.',
    );
  });

  it('includes a validated open record in the context line', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          pageContext: {
            path: '/sales/deal/board',
            record: { type: 'deal', id: 'deal_1-Ab' },
          },
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(firstSentPartText()).toBe(
      '[Page context] The user is viewing /sales/deal/board. Open record: deal deal_1-Ab (fetch it with tools if relevant).',
    );
  });

  it('silently drops an invalid pageContext instead of failing the request', async () => {
    for (const pageContext of [
      'not-an-object',
      { path: 'no-leading-slash' },
      { path: '/with\nnewline' },
      { path: `/${'x'.repeat(300)}` },
      { path: 42 },
    ]) {
      jest.clearAllMocks();
  jest.mocked(checkPermissionGroup).mockImplementation(() => async () => undefined);
  jest.mocked(isAgentsRunAlive).mockResolvedValue(true);
      const res = buildRes();
      await chatHandler(
        buildReq({
          user: ACTING_USER,
          body: { messages: [partsUserMessage('hi')], pageContext },
        }),
        res,
      );

      expect(res.statusCode).toBe(200);
      expect(streamMock).toHaveBeenCalled();
      expect(firstSentPartText()).not.toContain('[Page context]');
    }
  });

  it('drops an invalid record while keeping the valid path', async () => {
    for (const record of [
      { type: 'not-a-type', id: 'abc' },
      { type: 'deal', id: 'bad id!' },
      { type: 'deal' },
      'deal',
    ]) {
      jest.clearAllMocks();
  jest.mocked(checkPermissionGroup).mockImplementation(() => async () => undefined);
  jest.mocked(isAgentsRunAlive).mockResolvedValue(true);
      const res = buildRes();
      await chatHandler(
        buildReq({
          user: ACTING_USER,
          body: {
            messages: [partsUserMessage('hi')],
            pageContext: { path: '/sales/deals', record },
          },
        }),
        res,
      );

      expect(res.statusCode).toBe(200);
      expect(firstSentPartText()).toBe(
        '[Page context] The user is viewing /sales/deals.',
      );
    }
  });
});

describe('POST /agents/chat — navigation catalog', () => {
  const partsUserMessage = (text: string) => ({
    id: `m-${text}`,
    role: 'user',
    parts: [{ type: 'text', text }],
  });

  it('stamps a validated catalog into RequestContext', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          navigation: [
            { path: '/sales/deals', label: 'Deals', group: 'Sales' },
            { path: 'contacts/customers', label: 'Customers' },
          ],
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(mockedBuildAgentsRequestContext).toHaveBeenCalledWith(
      expect.objectContaining({
        navigation: expect.arrayContaining([
          { path: '/sales/deals', label: 'Deals', group: 'Sales' },
        ]),
      }),
    );
    const stamped =
      mockedBuildAgentsRequestContext.mock.calls[0][0].navigation;
    // '/contacts/customers' lacks the leading slash the validator requires.
    expect(stamped).toHaveLength(1);
  });

  it('sanitizes labels and drops malformed entries silently', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          navigation: [
            { path: '/a', label: 'has [[brackets]]\n and newline' },
            { path: '/with\nnewline', label: 'bad path' },
            { path: '/too-long', label: `x${'a'.repeat(120)}` },
            { path: '/dup', label: 'first' },
            { path: '/dup', label: 'second' },
            { path: '/nolabel' },
            'not-an-entry',
          ],
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    const stamped =
      mockedBuildAgentsRequestContext.mock.calls[0][0].navigation;
    expect(stamped).toEqual([
      { path: '/a', label: 'has brackets and newline' },
      { path: '/too-long', label: `x${'a'.repeat(79)}` },
      { path: '/dup', label: 'first' },
    ]);
  });

  it('caps the catalog at 400 entries', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          navigation: Array.from({ length: 450 }, (_, i) => ({
            path: `/p${i}`,
            label: `p${i}`,
          })),
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    const stamped =
      mockedBuildAgentsRequestContext.mock.calls[0][0].navigation;
    expect(stamped).toHaveLength(400);
  });

  it('rejects a page record type in pageContext (page is not a record type)', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          pageContext: {
            path: '/sales/deals',
            record: { type: 'page', id: 'abc123' },
          },
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    // The record is dropped; the valid path survives.
    const calls = streamMock.mock.calls[0][0] as {
      parts?: { type: string; text?: string }[];
    }[];
    expect(calls[0]?.parts?.[0]?.text).toBe(
      '[Page context] The user is viewing /sales/deals.',
    );
  });

  it('omits navigation when every entry is invalid', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [partsUserMessage('hi')],
          navigation: 'not-an-array',
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(
      mockedBuildAgentsRequestContext.mock.calls[0][0].navigation,
    ).toBeUndefined();
  });
});


it('validates selected page context and binds its snapshot as model media', async () => {
  const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');
  jest.mocked(readFileStreamFromStorage).mockResolvedValue(Readable.from([png]));
  const selection = {
    id: '47b58525-fceb-48ee-9262-dcd040c63bb2', title: 'Company', path: '/contacts', text: 'Company', width: 200, height: 60,
    snapshot: { url: 'snapshot.png', type: 'image/png', size: png.length },
  };
  const res = buildRes();
  await chatHandler(buildReq({ user: ACTING_USER, body: { messages: [{ id: 'selection', role: 'user', parts: [
    { type: 'text', text: 'Report on this company' }, { type: 'data-agents-page-selections', data: { selections: [selection] } },
  ] }] } }), res);
  expect(streamMock).toHaveBeenCalled();
  expect(JSON.stringify(streamMock.mock.calls[0][0])).toContain(`data:image/png;base64,${png.toString('base64')}`);
  expect(JSON.stringify(streamMock.mock.calls[0][0])).not.toContain('data-agents-files');
  expect(mockedBuildAgentsRequestContext).toHaveBeenCalledWith(expect.objectContaining({ attachmentUrls: ['snapshot.png'] }));
});
it('rejects malformed page context before accessing storage or starting the model', async () => {
  const res = buildRes();
  await chatHandler(buildReq({ user: ACTING_USER, body: { messages: [{ id: 'selection', role: 'user', parts: [
    { type: 'text', text: 'Explain' }, { type: 'data-agents-page-selections', data: { selections: [{ title: 'incomplete' }] } },
  ] }] } }), res);
  expect(res.statusCode).toBe(400); expect(streamMock).not.toHaveBeenCalled();
});

describe('POST /agents/references/resolve', () => {
  const resolveHandler = getHandler('post', '/agents/references/resolve');
  it('requires authentication and rejects model URLs or malformed identities', async () => {
    const noAuth = buildRes();
    await resolveHandler(
      buildReq({ body: { type: 'customer', id: 'c1' } }),
      noAuth,
    );
    expect(noAuth.statusCode).toBe(401);
    const invalid = buildRes();
    await resolveHandler(
      buildReq({
        user: ACTING_USER,
        body: { type: 'customer', id: 'https://wrong.test' },
      }),
      invalid,
    );
    expect(invalid.statusCode).toBe(400);
    expect(resolveAgentsReference).not.toHaveBeenCalled();
  });
  it('takes identity from the gateway and returns the current verified record', async () => {
    jest
      .mocked(resolveAgentsReference)
      .mockResolvedValueOnce({
        type: 'customer',
        id: 'c1',
        label: 'Current name',
      });
    const res = buildRes();
    await resolveHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          type: 'customer',
          id: 'c1',
          label: 'Spoofed',
          userId: 'spoofed',
        },
      }),
      res,
    );
    expect(res.body).toEqual({
      reference: { type: 'customer', id: 'c1', label: 'Current name' },
    });
    expect(resolveAgentsReference).toHaveBeenCalledWith(
      expect.objectContaining({ subdomain: 'tenant', userId: 'user-1' }),
      { type: 'customer', id: 'c1' },
    );
  });
  it('returns unavailable for a deleted or inaccessible record without a guessed path', async () => {
    jest.mocked(resolveAgentsReference).mockResolvedValueOnce(undefined);
    const res = buildRes();
    await resolveHandler(
      buildReq({ user: ACTING_USER, body: { type: 'customer', id: 'c1' } }),
      res,
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: 'This record is unavailable or you no longer have access.',
    });
  });
});



describe('agentsChat permission enforcement', () => {
  const runId = '550e8400-e29b-41d4-a716-446655440000';
  const cases = [
    {name: 'plain-text chat', handler: chatHandler, body: {threadId: 'thread', messages: [{id: 'permission-message', role: 'user', parts: [{type: 'text', text: 'Hello'}]}]}},
    {name: 'resume', handler: chatHandler, body: {threadId: 'thread', messages: [{id: 'assistant', role: 'assistant', parts: []}], resume: {runId, toolCallId: 'ask', answers: ['Yes']}}},
    {name: 'reconnect', handler: streamHandler, body: {}},
  ];

  it.each(cases)('rejects $name before accessing credentials or runtime when permission is revoked', async ({handler, body}) => {
    jest.mocked(checkPermissionGroup).mockImplementation(() => async () => {
      throw new ExpectedError('Permission denied', 'FORBIDDEN');
    });
    const res = buildRes();
    await handler(buildReq({user: ACTING_USER, body, params: {threadId: 'thread'}}), res);
    expect(res.statusCode).toBe(403);
    expect(mockedGetAgentsRuntime).not.toHaveBeenCalled();
    expect(mockedGenerateModels).not.toHaveBeenCalled();
    expect(streamMock).not.toHaveBeenCalled();
    expect(resumeStreamMock).not.toHaveBeenCalled();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('passes the authenticated thread and user to the native liveness check', async () => {
    memory.getThreadById.mockResolvedValue({resourceId: ACTING_USER._id});
    listActiveRunsMock.mockResolvedValue({runs: [{runId, status: 'running'}], total: 1});
    await streamHandler(buildReq({user: ACTING_USER, params: {threadId: 'thread'}}), buildRes());
    await observeMock.mock.calls[0][1]?.isAlive?.();
    expect(isAgentsRunAlive).toHaveBeenCalledWith(
      expect.objectContaining({memory}),
      {runId, threadId: 'thread', resourceId: ACTING_USER._id},
    );
  });
});
