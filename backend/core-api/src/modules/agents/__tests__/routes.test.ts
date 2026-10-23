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
}));
jest.mock('@mastra/ai-sdk', () => ({
  toAISdkStream: jest.fn(),
}));

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
const { toAISdkStream: mockedToAISdkStream } = jest.requireMock(
  '@mastra/ai-sdk',
) as { toAISdkStream: jest.Mock };

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
const approveHandler = getHandler('post', '/agents/approve');
const answerHandler = getHandler('post', '/agents/answer');
const reconnectHandler = getHandler('post', '/agents/chat/reconnect');

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
  return {
    headers,
    body: options.body ?? {},
    query: options.query ?? {},
    params: options.params ?? {},
  };
};

const ACTING_USER = { _id: 'user-1', email: 'agent@example.com' };
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  onSuspended?: () => void;
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

interface IApproveOptions {
  runId?: string;
  toolCallId?: string;
  reason?: string;
  memory?: {
    thread: string;
    resource: string;
    onTitleGenerated?: () => void;
  };
  onFinish?: () => void;
  onSuspended?: () => void;
  requestContext?: { get(key: string): unknown };
}

const listSuspendedRunsMock = jest.fn<
  Promise<{ runs: ISuspendedRun[]; total: number }>,
  [{ threadId?: string; resourceId?: string }?]
>(async () => ({ runs: [], total: 0 }));

const APPROVED_OUTPUT_SENTINEL = { sentinel: 'approved-output' };
const DECLINED_OUTPUT_SENTINEL = { sentinel: 'declined-output' };

const approveToolCallMock = jest.fn<Promise<unknown>, [IApproveOptions]>(
  async () => APPROVED_OUTPUT_SENTINEL,
);

const declineToolCallMock = jest.fn<Promise<unknown>, [IApproveOptions]>(
  async () => DECLINED_OUTPUT_SENTINEL,
);

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
  onSuspended?: () => void;
  requestContext?: { get(key: string): unknown };
}

const RESUMED_OUTPUT_SENTINEL = { sentinel: 'resumed-output' };

const resumeStreamMock = jest.fn<Promise<unknown>, [unknown, IResumeOptions]>(
  async () => RESUMED_OUTPUT_SENTINEL,
);

const MASTRA_SENTINEL = { sentinel: 'mastra-instance' };

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
  approveToolCallMock.mockImplementation(async () => APPROVED_OUTPUT_SENTINEL);
  declineToolCallMock.mockImplementation(async () => DECLINED_OUTPUT_SENTINEL);
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
  mockedGetAgentsRuntime.mockResolvedValue({
    memory,
    mastra: MASTRA_SENTINEL,
    agent: {
      stream: streamMock,
      listSuspendedRuns: listSuspendedRunsMock,
      approveToolCall: approveToolCallMock,
      declineToolCall: declineToolCallMock,
      resumeStream: resumeStreamMock,
      listActiveRuns: listActiveRunsMock,
      observe: observeMock,
    },
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

  it('rejects when the newest message is not from the user', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          messages: [
            userMessage('hi'),
            {
              id: 'a1',
              role: 'assistant',
              content: [{ type: 'text', text: 'hello' }],
            },
          ],
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe('The newest message must be from the user.');
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
    expect(res.headers['X-Agents-Thread-Id']).toBe('own-thread');
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

  it('starts a new thread when no threadId is supplied and announces the id before streaming', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    const announced = res.headers['X-Agents-Thread-Id'];
    expect(announced).toMatch(UUID_PATTERN);
    expect(memory.getThreadById).toHaveBeenCalledWith({ threadId: announced });
    expect(streamMock).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        memory: expect.objectContaining({
          thread: announced,
          resource: 'user-1',
        }),
      }),
    );
  });

  it('treats a blank threadId as a request for a new thread', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], threadId: '   ' },
      }),
      res,
    );

    const announced = res.headers['X-Agents-Thread-Id'];
    expect(announced).toMatch(UUID_PATTERN);
    expect(announced).not.toBe('   ');
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

  it('ends the response on suspension when writableEnded is false (headersSent true during SSE)', async () => {
    const res = buildRes();
    // Simulate SSE state: headers already sent but stream not ended.
    res.headers['X-Agents-Thread-Id'] = 'test';

    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    // The onSuspended callback was passed to stream; invoke it.
    const options = streamMock.mock.calls[0][1];
    expect(options.onSuspended).toBeDefined();

    // Before calling: writableEnded is false.
    expect(res.writableEnded).toBe(false);
    options.onSuspended?.();
    expect(res.writableEnded).toBe(true);
  });

  it('does not end the response on suspension when already ended', async () => {
    const res = buildRes();
    res.writableEnded = true;

    await chatHandler(
      buildReq({ user: ACTING_USER, body: { messages: [userMessage('hi')] } }),
      res,
    );

    const options = streamMock.mock.calls[0][1];
    options.onSuspended?.();
    // Stays true — no double-end.
    expect(res.writableEnded).toBe(true);
  });

  it('rejects a non-string runId with 400 instead of crashing', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], runId: 42 },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe('`runId` must be a valid UUID.');
    expect(streamMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed string runId with 400', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], runId: 'not-a-uuid' },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
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

  it('rejects a non-string threadId with 400 instead of crashing', async () => {
    const res = buildRes();
    await chatHandler(
      buildReq({
        user: ACTING_USER,
        body: { messages: [userMessage('hi')], threadId: 42 },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(streamMock).not.toHaveBeenCalled();
  });
});

describe('POST /agents/approve — destructive action approval resume', () => {
  const suspendedRun = (runId: string): ISuspendedRun => ({
    runId,
    toolCalls: [
      {
        toolCallId: 'call-1',
        toolName: 'callTool',
        requiresApproval: true,
        suspendPayload: {
          toolId: 'sales.trpc.deal.remove',
          input: { id: 'deal-1' },
        },
      },
    ],
  });

  it('rejects unauthenticated requests before touching the agent runtime', async () => {
    const res = buildRes();
    await approveHandler(
      buildReq({ body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(res.statusCode).toBe(401);
    expect(body(res).error).toBe('Authentication required');
    expect(streamMock).not.toHaveBeenCalled();
    expect(approveToolCallMock).not.toHaveBeenCalled();
    expect(declineToolCallMock).not.toHaveBeenCalled();
  });

  it('requires a threadId', async () => {
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { approved: true } }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe('`threadId` is required.');
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('requires an explicit boolean decision', async () => {
    const res = buildRes();
    await approveHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', approved: 'yes' },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe('`approved` must be true or false.');
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('defers connection validation to the durable agent on resume', async () => {
    // With durable agents, the connection check happens inside the
    // agent's dynamic model callback, not in the route preamble.
    // The route only checks ownership; if the thread exists and belongs
    // to the user, the resume proceeds.
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    connectionModel.getConnections.mockResolvedValue(null);
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    // The route succeeds; connection validation is deferred to the agent.
    expect(res.statusCode).toBe(200);
    expect(approveToolCallMock).toHaveBeenCalled();
  });

  it('returns 404 for an unknown thread', async () => {
    const res = buildRes();
    await approveHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 'missing', approved: true },
      }),
      res,
    );

    expect(res.statusCode).toBe(404);
    expect(body(res).error).toBe('Thread not found.');
    expect(listSuspendedRunsMock).not.toHaveBeenCalled();
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('refuses to resume a run in a thread owned by another user', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-other' });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(body(res).error).toBe('Thread belongs to another user.');
    expect(listSuspendedRunsMock).not.toHaveBeenCalled();
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('reports when nothing is awaiting approval on the thread', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(body(res).error).toBe('No pending approval exists for this thread.');
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('discovers the suspended run scoped to the thread and the acting user', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(listSuspendedRunsMock).toHaveBeenCalledWith({
      threadId: 't1',
      resourceId: 'user-1',
    });
    expect(res.statusCode).toBe(200);
  });

  it('ends the response when the resumed run suspends again (chained approval)', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    const options = approveToolCallMock.mock.calls[0][0];
    expect(options.onSuspended).toBeDefined();
    expect(res.writableEnded).toBe(false);
    options.onSuspended?.();
    expect(res.writableEnded).toBe(true);
  });

  it('approves the newest suspended tool call and streams the continuation', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-newest'), suspendedRun('run-older')],
      total: 2,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(approveToolCallMock).toHaveBeenCalledTimes(1);
    expect(declineToolCallMock).not.toHaveBeenCalled();
    expect(approveToolCallMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'run-newest',
        toolCallId: 'call-1',
        memory: expect.objectContaining({
          thread: 't1',
          resource: 'user-1',
        }),
      }),
    );
    const options = approveToolCallMock.mock.calls[0][0];
    // Durable agent resume options carry runId/toolCallId/memory/onFinish
    // but NOT requestContext (the agent uses its registered snapshot).
    expect(options.runId).toBe('run-newest');
    expect(options.toolCallId).toBe('call-1');
    expect(options.onFinish).toBeDefined();
    // onFinish publishes thread change so sidebar refreshes after resume.
    mockedPublishAgentsThreadsChanged.mockClear();
    options.onFinish?.();
    expect(mockedPublishAgentsThreadsChanged).toHaveBeenCalledWith('user-1');
    expect(res.headers['X-Agents-Thread-Id']).toBe('t1');
    expect(mockedToAISdkStream).toHaveBeenCalledWith(
      APPROVED_OUTPUT_SENTINEL,
      expect.objectContaining({ version: 'v7' }),
    );
    expect(mockedPipe).toHaveBeenCalledWith(
      expect.objectContaining({
        response: res,
        stream: { wrapped: APPROVED_OUTPUT_SENTINEL },
      }),
    );
  });

  it('declines the held tool call with the user’s reason instead of executing it', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', approved: false, reason: 'too risky' },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(approveToolCallMock).not.toHaveBeenCalled();
    expect(declineToolCallMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'run-1',
        toolCallId: 'call-1',
        reason: 'too risky',
      }),
    );
  });

  it('omits an empty rejection reason', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', approved: false, reason: '   ' },
      }),
      res,
    );

    const options = declineToolCallMock.mock.calls[0][0];
    expect(options).toEqual(
      expect.objectContaining({ runId: 'run-1', toolCallId: 'call-1' }),
    );
    expect(options).not.toHaveProperty('reason');
  });

  it('omits toolCallId when the suspended run does not report one', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-1',
          toolCalls: [{ toolName: 'callTool', requiresApproval: true }],
        },
      ],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    // Without a toolCallId the route defers to Mastra, which approves the
    // run's single pending tool call from its own snapshot.
    const options = approveToolCallMock.mock.calls[0][0];
    expect(options).not.toHaveProperty('toolCallId');
    expect(options).toEqual(expect.objectContaining({ runId: 'run-1' }));
  });

  it('409s when the newest suspension is an ask_user question, not an approval', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-ask',
          toolCalls: [
            {
              toolCallId: 'call-ask-1',
              toolName: 'askUser',
              requiresApproval: false,
            },
          ],
        },
      ],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    // Approving an ask_user suspension would decide a question instead of
    // the human's answer; it must be answered through /agents/answer.
    expect(res.statusCode).toBe(409);
    expect(body(res).error).toBe(
      'This thread is waiting for an answer, not an approval decision.',
    );
    expect(approveToolCallMock).not.toHaveBeenCalled();
    expect(declineToolCallMock).not.toHaveBeenCalled();
  });

  it('keeps 409 on a foreign-kind newest run even when an older run holds an approval', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-ask',
          toolCalls: [
            {
              toolCallId: 'call-ask-1',
              toolName: 'askUser',
              requiresApproval: false,
            },
          ],
        },
        suspendedRun('run-approval'),
      ],
      total: 2,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    // Suspensions resolve newest-first so the transcript stays in order;
    // the route never skips past a newer suspension to reach an older one.
    expect(res.statusCode).toBe(409);
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('selects the approval-gated call when the newest run holds mixed pending calls', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-mixed',
          toolCalls: [
            {
              toolCallId: 'call-ask-1',
              toolName: 'askUser',
              requiresApproval: false,
            },
            {
              toolCallId: 'call-destructive',
              toolName: 'callTool',
              requiresApproval: true,
            },
          ],
        },
      ],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(approveToolCallMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: 'run-mixed',
        toolCallId: 'call-destructive',
      }),
    );
  });

  it.each([42, '', 'x'.repeat(201)])(
    'rejects an invalid approval target (%s)',
    async (toolCallId) => {
      const res = buildRes();
      await approveHandler(
        buildReq({
          user: ACTING_USER,
          body: { threadId: 't1', approved: true, toolCallId },
        }),
        res,
      );
      expect(res.statusCode).toBe(400);
      expect(approveToolCallMock).not.toHaveBeenCalled();
    },
  );

  it('rejects a stale approval rather than applying it to the next suspended call', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 't1',
          approved: true,
          toolCallId: 'old-call',
        },
      }),
      res,
    );
    expect(res.statusCode).toBe(409);
    expect(approveToolCallMock).not.toHaveBeenCalled();
  });

  it('resumes the explicitly answered call rather than the first listed approval', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const run = suspendedRun('run-1');
    run.toolCalls?.push({
      toolCallId: 'call-2',
      toolName: 'callGraphql',
      requiresApproval: true,
    });
    listSuspendedRunsMock.mockResolvedValue({ runs: [run], total: 1 });
    const res = buildRes();
    await approveHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 't1',
          approved: false,
          toolCallId: 'call-2',
        },
      }),
      res,
    );
    expect(declineToolCallMock).toHaveBeenCalledWith(
      expect.objectContaining({ toolCallId: 'call-2' }),
    );
  });

  it('maps unexpected resume failures to a JSON 500 instead of crashing', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [suspendedRun('run-1')],
      total: 1,
    });
    approveToolCallMock.mockRejectedValueOnce(new Error('snapshot lost'));
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    expect(res.statusCode).toBe(500);
    expect(body(res).error).toBe('snapshot lost');
    expect(mockedPipe).not.toHaveBeenCalled();
  });
});

describe('POST /agents/answer — ask_user answer resume', () => {
  // The canonical ask_user suspension: requiresApproval false (the tool
  // called suspend() itself) and a suspendPayload carrying the question.
  const askUserRun = (runId: string): ISuspendedRun => ({
    runId,
    toolCalls: [
      {
        toolCallId: 'call-ask-1',
        toolName: 'askUser',
        requiresApproval: false,
        suspendPayload: {
          question: 'Which deal should I summarize?',
          options: [
            { label: 'Biggest open deal' },
            { label: 'Most recent deal' },
          ],
        },
      },
    ],
  });

  it('rejects unauthenticated requests before touching the agent runtime', async () => {
    const res = buildRes();
    await answerHandler(
      buildReq({ body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    expect(res.statusCode).toBe(401);
    expect(body(res).error).toBe('Authentication required');
    expect(streamMock).not.toHaveBeenCalled();
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('rejects a missing threadId', async () => {
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { answer: 'yes' } }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe('`threadId` is required.');
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', undefined],
    ['empty string', '   '],
    ['empty array', []],
    ['array of blanks', ['  ', '']],
    ['array with an empty inner array', [['yes'], []]],
    ['non-string object', { text: 'yes' }],
    ['number', 42],
  ])('rejects an answer that is %s', async (_label, answer) => {
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer } }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(body(res).error).toBe(
      '`answer` must be a non-empty string, a non-empty string array, or an array of per-question answers.',
    );
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('resumes with per-question positional answers untouched', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', answer: ['Sales', ['Won deals', 'Pipeline']] },
      }),
      res,
    );

    expect(resumeStreamMock).toHaveBeenCalledTimes(1);
    const [resumeData, options] = resumeStreamMock.mock.calls[0];
    expect(resumeData).toEqual(['Sales', ['Won deals', 'Pipeline']]);
    expect(options).toEqual(
      expect.objectContaining({
        runId: 'run-1',
        toolCallId: 'call-ask-1',
        maxSteps: 32,
        memory: {
          thread: 't1',
          resource: 'user-1',
          onTitleGenerated: expect.any(Function),
        },
      }),
    );
  });

  it('does not persist the answer as a user message before resuming', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 't1',
          answer: ['Сар сонгосон', ['Долоо хоног 1', 'Долоо хоног 2']],
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    // The answer survives inside the ask_user tool result that the resumed
    // run persists (the UI renders it as the answered Q&A card), so storing
    // it a second time as a user message would only duplicate model context.
    expect(memory.saveMessages).not.toHaveBeenCalled();
  });

  it('refuses to resume a run owned by another user', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-other' });
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    expect(res.statusCode).toBe(403);
    expect(body(res).error).toBe('Thread belongs to another user.');
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('404s for a missing thread', async () => {
    memory.getThreadById.mockResolvedValue(null);
    const res = buildRes();
    await answerHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 'ghost', answer: 'yes' },
      }),
      res,
    );

    expect(res.statusCode).toBe(404);
    expect(body(res).error).toBe('Thread not found.');
  });

  it('409s when no run is suspended for the thread', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({ runs: [], total: 0 });
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    expect(res.statusCode).toBe(409);
    expect(body(res).error).toBe(
      'No pending interaction exists for this thread.',
    );
    expect(resumeStreamMock).not.toHaveBeenCalled();
  });

  it('409s when the suspension is an approval, not an ask_user question', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-gate',
          toolCalls: [
            {
              toolCallId: 'call-1',
              toolName: 'callTool',
              requiresApproval: true,
            },
          ],
        },
      ],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    // Answering an approval gate would execute the gated tool; it must be
    // decided through /agents/approve instead.
    expect(res.statusCode).toBe(409);
    expect(body(res).error).toBe(
      'This thread is waiting for an approval decision, not an answer.',
    );
    expect(approveToolCallMock).not.toHaveBeenCalled();
    expect(resumeStreamMock).not.toHaveBeenCalled();
    // An approval is not an answer; nothing may be persisted for it.
    expect(memory.saveMessages).not.toHaveBeenCalled();
  });

  it('resumes the newest suspended ask_user run with the answer and streams it', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-2'), askUserRun('run-1')],
      total: 2,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', answer: 'Biggest open deal' },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers['X-Agents-Thread-Id']).toBe('t1');
    // The answer is exactly what the user picked, resumed into the newest
    // run, scoped to that specific tool call, with memory/thread continuity.
    expect(resumeStreamMock).toHaveBeenCalledTimes(1);
    const [resumeData, options] = resumeStreamMock.mock.calls[0];
    expect(resumeData).toBe('Biggest open deal');
    expect(options).toEqual(
      expect.objectContaining({
        runId: 'run-2',
        toolCallId: 'call-ask-1',
        maxSteps: 32,
        memory: {
          thread: 't1',
          resource: 'user-1',
          onTitleGenerated: expect.any(Function),
        },
      }),
    );
    expect(mockedPipe).toHaveBeenCalledWith(
      expect.objectContaining({
        response: res,
        stream: { wrapped: RESUMED_OUTPUT_SENTINEL },
      }),
    );
  });

  it('resumes with a trimmed multi-select answer array', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', answer: [' Deal A  ', 'Deal B'] },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    const [resumeData] = resumeStreamMock.mock.calls[0];
    expect(resumeData).toEqual(['Deal A', 'Deal B']);
    // The answer is only resumed into the run — never stored as its own
    // user message (it survives inside the ask_user tool result).
    expect(memory.saveMessages).not.toHaveBeenCalled();
  });

  it('ends the response when the answered run suspends again (chained gate)', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    const options = resumeStreamMock.mock.calls[0][1];
    expect(options.onSuspended).toBeDefined();
    expect(res.writableEnded).toBe(false);
    options.onSuspended?.();
    expect(res.writableEnded).toBe(true);
  });

  it('accepts body selection fields on resume without controlling rehydration', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-1')],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 't1',
          answer: 'yes',
          provider: 'openai',
          model: 'gpt-5.6-luna',
          thinkingLevel: 'high',
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(200);
    // The durable agent uses its registered/snapshot RequestContext so
    // provider/model/thinking stay from the original run; body fields
    // are accepted for compatibility but do not rebuild anything.
    expect(streamMock).not.toHaveBeenCalled();
    expect(resumeStreamMock).toHaveBeenCalled();
  });

  it('omits toolCallId when the suspended run does not report one', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-1',
          toolCalls: [{ toolName: 'askUser', requiresApproval: false }],
        },
      ],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    expect(res.statusCode).toBe(200);
    const options = resumeStreamMock.mock.calls[0][1];
    expect(options).not.toHaveProperty('toolCallId');
    expect(options).toEqual(expect.objectContaining({ runId: 'run-1' }));
  });

  it('selects the ask_user call when the newest run holds mixed pending calls', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [
        {
          runId: 'run-mixed',
          toolCalls: [
            {
              toolCallId: 'call-destructive',
              toolName: 'callTool',
              requiresApproval: true,
            },
            {
              toolCallId: 'call-ask-1',
              toolName: 'askUser',
              requiresApproval: false,
            },
          ],
        },
      ],
      total: 1,
    });
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    expect(resumeStreamMock).toHaveBeenCalledWith(
      'yes',
      expect.objectContaining({
        runId: 'run-mixed',
        toolCallId: 'call-ask-1',
      }),
    );
  });

  it('maps unexpected resume failures to a JSON 500 instead of crashing', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [askUserRun('run-1')],
      total: 1,
    });
    resumeStreamMock.mockRejectedValueOnce(new Error('snapshot lost'));
    const res = buildRes();
    await answerHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', answer: 'yes' } }),
      res,
    );

    expect(res.statusCode).toBe(500);
    expect(body(res).error).toBe('snapshot lost');
    expect(mockedPipe).not.toHaveBeenCalled();
  });
});

describe('code mode flag resolved from tenant settings', () => {
  const codeSuspendedRun = (runId: string): ISuspendedRun => ({
    runId,
    toolCalls: [
      {
        toolCallId: 'call-code',
        toolName: 'callTool',
        requiresApproval: true,
        suspendPayload: {
          toolId: 'sales.trpc.deal.remove',
          input: { id: 'deal-1' },
        },
      },
    ],
  });

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

  it('does not stamp codeModeEnabled on resume routes (uses snapshot)', async () => {
    enableCodeMode();
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listSuspendedRunsMock.mockResolvedValue({
      runs: [codeSuspendedRun('run-code')],
      total: 1,
    });
    const res = buildRes();
    await approveHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1', approved: true } }),
      res,
    );

    // Resume routes use the durable agent's snapshot context; no new
    // request context is built.
    expect(mockedBuildAgentsRequestContext).not.toHaveBeenCalled();
    expect(approveToolCallMock).toHaveBeenCalled();
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

describe('POST /agents/chat/reconnect', () => {
  it('rejects unauthenticated requests', async () => {
    const res = buildRes();
    await reconnectHandler(
      buildReq({ body: { threadId: 't1', runId: 'r1' } }),
      res,
    );

    expect(res.statusCode).toBe(401);
  });

  it('requires both threadId and runId', async () => {
    const res = buildRes();
    await reconnectHandler(
      buildReq({ user: ACTING_USER, body: { threadId: 't1' } }),
      res,
    );

    expect(res.statusCode).toBe(400);
  });

  it('requires runId to be a valid UUID but accepts arbitrary threadId', async () => {
    const res = buildRes();
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 'legacy-thread-id',
          runId: 'not-a-uuid',
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(400);
    expect((res.body as { error: string }).error).toBe(
      '`runId` must be a valid UUID.',
    );
  });

  it('returns 204 when the run is not active', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    listActiveRunsMock.mockResolvedValue({ runs: [], total: 0 });
    const res = buildRes();
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 't1',
          runId: '550e8400-e29b-41d4-a716-446655440000',
        },
      }),
      res,
    );

    expect(res.statusCode).toBe(204);
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('observes the exact active run and pipes its output', async () => {
    memory.getThreadById.mockResolvedValue({ resourceId: 'user-1' });
    const targetRunId = '550e8400-e29b-41d4-a716-446655440000';
    listActiveRunsMock.mockResolvedValue({
      runs: [{ runId: targetRunId, status: 'running' }],
      total: 1,
    });
    const res = buildRes();
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
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
    // Simulate SSE state: headers already sent but stream not ended.
    res.headers['X-Agents-Thread-Id'] = 't1';

    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
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
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: {
          threadId: 't1',
          runId: '550e8400-e29b-41d4-a716-446655440000',
        },
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
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
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
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
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
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
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
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
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
    mockedPipe.mockImplementationOnce(() => {
      throw new Error('late stream failure');
    });
    const res = buildRes();
    await reconnectHandler(
      buildReq({
        user: ACTING_USER,
        body: { threadId: 't1', runId: targetRunId },
      }),
      res,
    );

    // pipeModelOutput sent the SSE headers before the pump failed, so the
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
    {name: 'plain-text chat', handler: chatHandler, body: {messages: [{id: 'permission-message', role: 'user', parts: [{type: 'text', text: 'Hello'}]}]}},
    {name: 'approval', handler: approveHandler, body: {threadId: 'thread', approved: true}},
    {name: 'answer', handler: answerHandler, body: {threadId: 'thread', answer: 'Yes'}},
    {name: 'reconnect', handler: reconnectHandler, body: {threadId: 'thread', runId}},
  ];

  it.each(cases)('rejects $name before accessing credentials or runtime when permission is revoked', async ({handler, body}) => {
    jest.mocked(checkPermissionGroup).mockImplementation(() => async () => {
      throw new ExpectedError('Permission denied', 'FORBIDDEN');
    });
    const res = buildRes();
    await handler(buildReq({user: ACTING_USER, body}), res);
    expect(res.statusCode).toBe(403);
    expect(mockedGetAgentsRuntime).not.toHaveBeenCalled();
    expect(mockedGenerateModels).not.toHaveBeenCalled();
    expect(streamMock).not.toHaveBeenCalled();
    expect(approveToolCallMock).not.toHaveBeenCalled();
    expect(resumeStreamMock).not.toHaveBeenCalled();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('passes the authenticated thread and user to the native liveness check', async () => {
    memory.getThreadById.mockResolvedValue({resourceId: ACTING_USER._id});
    listActiveRunsMock.mockResolvedValue({runs: [{runId, status: 'running'}], total: 1});
    await reconnectHandler(buildReq({user: ACTING_USER, body: {threadId: 'thread', runId}}), buildRes());
    await observeMock.mock.calls[0][1]?.isAlive?.();
    expect(isAgentsRunAlive).toHaveBeenCalledWith(
      expect.objectContaining({memory}),
      {runId, threadId: 'thread', resourceId: ACTING_USER._id},
    );
  });
});
