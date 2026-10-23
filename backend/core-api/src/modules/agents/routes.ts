import {
  agentsReferenceLookupSchema,
  resolveAgentsReference,
} from '@/agents/referenceResolution';
import {
  collectAgentsPageSelections,
  AgentsPageSelectionError,
} from '@/agents/pageSelections';
import type { UIMessage } from 'ai' with { 'resolution-mode': 'import' };
import type { MastraMemory } from '@mastra/core/memory' with {
  'resolution-mode': 'import',
};
import type { ChatStreamHandlerParams } from '@mastra/ai-sdk' with {
  'resolution-mode': 'import',
};
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import { randomUUID } from 'crypto';
import express, { Router } from 'express';
import { z } from 'zod';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import {
  ExpectedError,
  extractUserFromHeader,
  getSubdomain,
} from 'erxes-api-shared/utils';
import {
  isAgentsThinkingLevel,
  AGENTS_MAX_STEPS,
  buildAgentsModelSettings,
  type IAgentsThinkingLevel,
} from '@/agents/agent';
import { getAgentsRuntime, type IAgentsRuntime } from '@/agents/memory';
import { askUserAnswersSchema } from '@/agents/askUser';
import { isAgentsRunAlive } from '@/agents/runLiveness';
import { publishAgentsThreadsChanged } from '@/agents/threadsEvents';
import {
  AgentsMessageEditError,
  withRewoundAgentsHistory,
} from '@/agents/messageEditing';
import { buildAgentsRequestContext } from '@/agents/requestContext';
import type { IAgentsNavigationEntry } from '@/agents/requestContext';
import {
  AgentsFileBindError,
  assertNoClientMediaParts,
  collectAgentsAttachments,
  prepareAgentsFileMessage,
} from '@/agents/fileBinding';
import {
  AGENT_REFERENCE_ID_RE,
  isAgentReferenceType,
  sanitizeLabel,
  type IAgentReferenceType,
} from '@/agents/references';
import { generateModels, type IModels } from '~/connectionResolvers';

/**
 * HTTP surface for the agents chat API.
 *
 * The agents module runs one stable native DurableAgent per cached tenant
 * runtime (not one agent per request). The base Agent's dynamic model
 * callback re-fetches the acting user's current BYOK credentials from the
 * RequestContext snapshot (subdomain/userId/provider/model), so the same
 * instance serves every request and durable resume without leaks.
 *
 * - `POST /agents/chat` streams an AI SDK v7 UI message stream through
 *   Mastra's `handleChatStream`. The body's `threadId` is the client's Chat
 *   id. A user message starts a run; an assistant message resumes the run
 *   it is suspended on, with approval decisions or an ask_user `resume`.
 * - `GET /agents/chat/:threadId/stream` is the AI SDK's reconnect route. It
 *   observes the thread's running run across replicas/processes via the
 *   shared Redis Streams bus.
 *
 * Threads and messages are persisted by Mastra Memory backed by MongoDBStore
 * over this plugin's shared mongoose connection.
 */

interface IRequestIdentity {
  subdomain: string;
  userId: string;
  user: IUserDocument;
}

/** Error carrying an HTTP status so route handlers map failures to 4xx/5xx. */
class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorStatus = (error: unknown): number => {
  if (error instanceof HttpError) return error.statusCode;
  if (error instanceof ExpectedError) {
    if (error.code === 'UNAUTHORIZED') return 401;
    if (error.code === 'FORBIDDEN') return 403;
  }
  return 500;
};

const jsonError = (
  res: express.Response,
  status: number,
  error: unknown,
): void => {
  // Streaming routes (chat and its reconnect) can fail AFTER the
  // SSE headers were already sent — a late stream error, or a suspension
  // callback that already ended the response. Writing a JSON error then
  // throws ERR_HTTP_HEADERS_SENT out of the catch block and crashes the
  // process. End the stream instead so the client sees a disconnect it can
  // recover from by reconnecting.
  if (res.headersSent || res.writableEnded) {
    if (!res.writableEnded) {
      res.end();
    }

    return;
  }

  res.status(status).json({
    error: error instanceof Error ? error.message : 'Unexpected error',
  });
};

const getIdentity = (req: express.Request): IRequestIdentity | null => {
  const user = extractUserFromHeader(req.headers);

  if (!user?._id) {
    return null;
  }

  return {
    subdomain: getSubdomain(req),
    userId: user._id,
    user: user as IUserDocument,
  };
};

/**
 * Enforces ownership of the thread a chat turn writes into: an existing
 * thread must belong to the acting user (403 otherwise); an unknown id
 * starts a new thread.
 */
const resolveOwnedThread = async ({
  memory,
  identity,
  threadId,
}: {
  memory: MastraMemory;
  identity: IRequestIdentity;
  threadId: string;
}): Promise<{ isNew: boolean }> => {
  const existing = await memory.getThreadById({ threadId });

  if (existing && existing.resourceId !== identity.userId) {
    throw new HttpError(403, 'Thread belongs to another user.');
  }

  return { isNew: !existing };
};

/**
 * Resolves the acting user's stored BYOK connection for a chat turn.
 * Without one the user is told exactly what is missing; the key
 * itself is never echoed into the error.
 */
const resolveUserConnections = async (
  models: IModels,
  userId: string,
): Promise<IAiAgentConnection[]> => {
  const doc = await models.AgentsConnection.getConnections(userId);

  if (!doc || doc.connections.length === 0) {
    throw new HttpError(400, 'Add your API key to start using Agents.');
  }

  return doc.connections;
};

/**
 * Picks the connection a turn runs on: the body's provider when given
 * (validated against the user's stored entries), otherwise the first
 * configured provider. An explicit `model` overrides the stored one for
 * this turn only and is never persisted.
 */
const pickConnection = (
  connections: IAiAgentConnection[],
  provider?: string,
  model?: string,
): IAiAgentConnection => {
  const requestedProvider = provider?.trim();
  const selected = requestedProvider
    ? connections.find(
        (connection) => connection.provider === requestedProvider,
      )
    : connections[0];

  if (!selected) {
    throw new HttpError(
      400,
      `No connection stored for provider "${requestedProvider}". Add it under Settings → API key.`,
    );
  }

  const requestedModel = model?.trim();

  return requestedModel ? { ...selected, model: requestedModel } : selected;
};

const parseThinkingLevel = (value: unknown): IAgentsThinkingLevel =>
  isAgentsThinkingLevel(value) ? value : 'off';

/** Bounds reconnects to orphaned running snapshots with no live producer. */
const AGENTS_RECONNECT_IDLE_TIMEOUT_MS = 60_000;

/**
 * Reads the tenant's feature flags so chat stamps them into the
 * RequestContext. A resumed run uses the original snapshot's values.
 */
const resolveRunSettings = async (
  models: IModels,
): Promise<{ codeModeEnabled: boolean; approvalMode: 'writes' | 'destructive' }> => {
  const settings = await models.AgentsSettings.getSettings();

  return {
    codeModeEnabled: settings.codeModeEnabled === true,
    // Docs written before approvalMode existed behave as 'writes' — the
    // fail-safe default that holds every mutation for human approval.
    approvalMode: settings.approvalMode === 'destructive' ? 'destructive' : 'writes',
  };
};

/** Delimiter prefix the UI strips when rendering stored user messages. */
const PAGE_CONTEXT_PREFIX = '[Page context]';

const PAGE_CONTEXT_MAX_PATH_LENGTH = 200;
// Reject control characters in the client-supplied path.
// eslint-disable-next-line no-control-regex
const PAGE_CONTEXT_PATH_BAD_CHAR_RE = /[\x00-\x1f\x7f]/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Validates the optional `pageContext` body field. `path` is required for the
 * feature to make sense, so an invalid path drops the whole context; an
 * invalid `record` is dropped by itself. Anything invalid is silently
 * ignored — page context is a hint, never worth a 400.
 */
const parsePageContext = (
  raw: unknown,
): { path: string; record?: { type: IAgentReferenceType; id: string } } | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const path = raw.path;

  if (
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.length > PAGE_CONTEXT_MAX_PATH_LENGTH ||
    PAGE_CONTEXT_PATH_BAD_CHAR_RE.test(path)
  ) {
    return undefined;
  }

  const record = isRecord(raw.record) ? raw.record : undefined;

  if (
    record &&
    isAgentReferenceType(record.type) &&
    typeof record.id === 'string' &&
    AGENT_REFERENCE_ID_RE.test(record.id)
  ) {
    return { path, record: { type: record.type, id: record.id } };
  }

  return { path };
};

/**
 * Builds the model-only context line prepended to the newest user message.
 * Mastra memory persists it as part of the stored message; the bracketed
 * prefix is the documented delimiter the UI strips on render.
 */
/** Max navigation catalog entries the client may send per chat call. */
const NAVIGATION_MAX_ENTRIES = 400;

/**
 * Validates the optional `navigation` body field: the client's catalog
 * of pages it can open, used by the `findPages` tool. Each entry must
 * satisfy the same rules as a pageContext `path`, and `label`/`group`
 * are sanitized like reference labels; entries that fail are dropped
 * silently — the catalog is client metadata, never a 400.
 */
const parseNavigation = (
  raw: unknown,
): IAgentsNavigationEntry[] | undefined => {
  if (!Array.isArray(raw)) return undefined;

  const entries: IAgentsNavigationEntry[] = [];
  const seen = new Set<string>();

  for (const item of raw.slice(0, NAVIGATION_MAX_ENTRIES)) {
    if (!isRecord(item)) continue;
    const { path, label, group } = item;

    if (
      typeof path !== 'string' ||
      !path.startsWith('/') ||
      path.length > PAGE_CONTEXT_MAX_PATH_LENGTH ||
      PAGE_CONTEXT_PATH_BAD_CHAR_RE.test(path)
    ) {
      continue;
    }

    const cleanLabel =
      typeof label === 'string' ? sanitizeLabel(label) : '';
    if (!cleanLabel) continue;

    if (seen.has(path)) continue;
    seen.add(path);

    const cleanGroup =
      typeof group === 'string' ? sanitizeLabel(group) : '';
    entries.push(
      cleanGroup
        ? { path, label: cleanLabel, group: cleanGroup }
        : { path, label: cleanLabel },
    );
  }

  return entries.length ? entries : undefined;
};

const buildPageContextText = (context: {
  path: string;
  record?: { type: IAgentReferenceType; id: string };
}): string => {
  const record = context.record
    ? ` Open record: ${context.record.type} ${context.record.id} (fetch it with tools if relevant).`
    : '';

  return `${PAGE_CONTEXT_PREFIX} The user is viewing ${context.path}.${record}`;
};

/**
 * Readable client-facing message for a failed model stream. Mastra's
 * `@mastra/ai-sdk` adapter may hand `onError` a plain serialized error
 * object (`{ name, message, stack }`) rather than an `Error` instance, so
 * both shapes are unwrapped. Provider errors (rate limits, unsupported
 * parameters, invalid keys) carry actionable text and no secrets — the
 * API key never appears in an error body — so the message is forwarded
 * instead of a generic dead end.
 */
const describeStreamError = (error: unknown): string => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : '';

  return message.trim() || 'The model failed to generate a response.';
};

/** Re-checks that the acting user owns an existing thread. */
const assertOwnedThread = async (
  memory: MastraMemory,
  identity: IRequestIdentity,
  threadId: string,
): Promise<void> => {
  const thread = await memory.getThreadById({ threadId });

  if (!thread) {
    throw new HttpError(404, 'Thread not found.');
  }

  if (thread.resourceId !== identity.userId) {
    throw new HttpError(403, 'Thread belongs to another user.');
  }
};

/**
 * Run options every chat turn and resume shares. `closeOnSuspend` ends the
 * response once the suspended snapshot is saved, so the client can approve
 * or answer right away.
 */
const buildRunOptions = (identity: IRequestIdentity, threadId: string) => ({
  maxSteps: AGENTS_MAX_STEPS,
  memory: {
    thread: threadId,
    resource: identity.userId,
    onTitleGenerated: () => publishAgentsThreadsChanged(identity.userId),
  },
  onFinish: () => publishAgentsThreadsChanged(identity.userId),
  closeOnSuspend: true,
});

/**
 * Streams one agent turn with Mastra's `handleChatStream`. It runs a user
 * turn, resumes approval-responded tool calls in the assistant message, or
 * resumes an ask_user call when `resumeData` is set. `ai` and
 * `@mastra/ai-sdk` are ESM-only, so they load dynamically from CommonJS.
 */
const streamChat = async (
  res: express.Response,
  runtime: IAgentsRuntime,
  params: ChatStreamHandlerParams<UIMessage>,
): Promise<void> => {
  const { pipeUIMessageStreamToResponse } = await import('ai');
  const { handleChatStream } = await import('@mastra/ai-sdk');
  const stream = await handleChatStream({
    mastra: runtime.mastra,
    agentId: runtime.agent.id,
    version: 'v7',
    onError: describeStreamError,
    params,
  });

  pipeUIMessageStreamToResponse({ response: res, stream });
};

/** The ask_user answers the client resumes a suspended call with. */
const askUserResumeBodySchema = z.object({
  runId: z.string().min(1),
  toolCallId: z.string().min(1),
  answers: askUserAnswersSchema,
});

/**
 * Builds the handler params for an assistant-message request: approval
 * decisions or an ask_user answer. Every target must be a call suspended in
 * this user's thread, of the matching kind, so a client cannot resume a run
 * it does not own or answer an approval gate with ask_user data.
 */
const buildResumeParams = async ({
  runtime,
  identity,
  threadId,
  message,
  resume,
}: {
  runtime: IAgentsRuntime;
  identity: IRequestIdentity;
  threadId: string;
  message: UIMessage;
  resume: unknown;
}): Promise<ChatStreamHandlerParams<UIMessage>> => {
  await assertOwnedThread(runtime.memory, identity, threadId);

  const { runs } = await runtime.agent.listSuspendedRuns({
    threadId,
    resourceId: identity.userId,
  });
  const isSuspended = (
    runId: string,
    toolCallId: string,
    requiresApproval: boolean,
  ) =>
    runs.some(
      (run) =>
        run.runId === runId &&
        (run.toolCalls ?? []).some(
          (call) =>
            call.toolCallId === toolCallId &&
            (call.requiresApproval === true) === requiresApproval,
        ),
    );
  const runOptions = buildRunOptions(identity, threadId);

  if (resume !== undefined) {
    const parsed = askUserResumeBodySchema.safeParse(resume);

    if (!parsed.success) {
      throw new HttpError(400, '`resume` needs runId, toolCallId and answers.');
    }

    const { runId, toolCallId, answers } = parsed.data;

    if (!isSuspended(runId, toolCallId, false)) {
      throw new HttpError(409, 'This question is no longer waiting for an answer.');
    }

    // `toolCallId` is a resume option Mastra's public stream type omits.
    const target = { runId, toolCallId };

    return {
      messages: [message],
      resumeData: { answers },
      ...target,
      ...runOptions,
    };
  }

  const { isToolUIPart } = await import('ai');
  // Mastra's approval ids are `${runId}::${toolCallId}`.
  const decisions = message.parts.flatMap((part) =>
    isToolUIPart(part) && part.state === 'approval-responded'
      ? [
          {
            runId: part.approval.id.slice(0, part.approval.id.lastIndexOf('::')),
            toolCallId: part.toolCallId,
          },
        ]
      : [],
  );

  if (!decisions.length) {
    throw new HttpError(400, 'The assistant message holds no decision to resume.');
  }

  if (
    decisions.some(({ runId, toolCallId }) => !isSuspended(runId, toolCallId, true))
  ) {
    throw new HttpError(409, 'This tool call is no longer awaiting a decision.');
  }

  return { messages: [message], ...runOptions };
};

export const router: Router = Router();

/** Read the current record through the acting user's normal GraphQL permissions. */
router.post('/agents/references/resolve', async (req, res) => {
  const identity = getIdentity(req);
  if (!identity) {
    jsonError(res, 401, new Error('Unauthorized'));
    return;
  }
  const parsed = agentsReferenceLookupSchema.safeParse(req.body);
  if (!parsed.success) {
    jsonError(res, 400, new Error('Invalid record reference.'));
    return;
  }
  try {
    await checkPermissionGroup(identity.subdomain, identity.user)('agentsChat');
    const reference = await resolveAgentsReference(identity, parsed.data);
    if (!reference) {
      jsonError(
        res,
        404,
        new Error('This record is unavailable or you no longer have access.'),
      );
      return;
    }
    res.json({ reference });
  } catch {
    jsonError(
      res,
      404,
      new Error('This record is unavailable or you no longer have access.'),
    );
  }
});

/**
 * Prepares a user turn: validates the body, binds attachments and page
 * selections, creates the thread on its first turn and stamps the run's
 * RequestContext. An edit rewinds stored history before the turn starts.
 */
const startUserTurn = async ({
  res,
  identity,
  threadId,
  newestMessage,
  body,
}: {
  res: express.Response;
  identity: IRequestIdentity;
  threadId: string;
  newestMessage: UIMessage;
  body: IChatRequestBody;
}): Promise<void> => {
  if (
    body.editMessageId !== undefined &&
    (typeof body.editMessageId !== 'string' ||
      !body.editMessageId.trim() ||
      body.editMessageId !== newestMessage.id)
  ) {
    throw new HttpError(
      400,
      'An edit must identify the user message and its existing thread.',
    );
  }

  // Provider/model overrides must be strings when present; a wrong-typed
  // value 400s instead of throwing inside `pickConnection` (500).
  if (
    (body.provider !== undefined && typeof body.provider !== 'string') ||
    (body.model !== undefined && typeof body.model !== 'string')
  ) {
    throw new HttpError(
      400,
      '`provider` and `model` must be strings when provided.',
    );
  }

  await checkPermissionGroup(identity.subdomain, identity.user)('agentsChat');
  assertNoClientMediaParts(newestMessage);
  if (body.fileIds !== undefined) {
    throw new AgentsFileBindError(
      400,
      'Use standard attachments instead of fileIds. Please attach the files again.',
    );
  }
  const selections = collectAgentsPageSelections(
    Array.isArray(newestMessage.parts) ? newestMessage.parts : [],
  );
  const files = collectAgentsAttachments(
    Array.isArray(newestMessage.parts) ? newestMessage.parts : [],
  );

  const models = await generateModels(identity.subdomain);
  const connections = await resolveUserConnections(models, identity.userId);
  const connection = pickConnection(connections, body.provider, body.model);
  const thinkingLevel = parseThinkingLevel(body.thinkingLevel);
  const runSettings = await resolveRunSettings(models);
  const runtime = await getAgentsRuntime(identity.subdomain);
  const { isNew } = await resolveOwnedThread({
    memory: runtime.memory,
    identity,
    threadId,
  });

  const preparedMessage = await prepareAgentsFileMessage(
    identity.subdomain,
    { id: typeof newestMessage.id === 'string' ? newestMessage.id : randomUUID(), role: 'user', parts: newestMessage.parts },
    files,
    selections,
  );

  // Page context is a model-only hint: a delimited text part prepended to
  // the newest user message. Mastra memory persists it inside the stored
  // message; the UI strips the bracketed prefix when rendering history.
  const pageContext = parsePageContext(body.pageContext);
  const navigation = parseNavigation(body.navigation);
  const messageForModel: UIMessage = pageContext
    ? {
        ...preparedMessage,
        parts: [
          { type: 'text', text: buildPageContextText(pageContext) },
          ...(preparedMessage.parts ?? []),
        ],
      }
    : preparedMessage;

  // A conversation exists when the accepted user request starts, not when
  // model generation or asynchronous title generation eventually finishes.
  // Use Mastra's native storage; preserve an absent title for auto-titling.
  if (isNew) {
    await runtime.memory.createThread({
      threadId,
      resourceId: identity.userId,
    });
    publishAgentsThreadsChanged(identity.userId);
  }

  // Stamp the exact non-secret selection into RequestContext. This
  // snapshot lets a cross-request/cross-process resume re-fetch current
  // credentials without persisting them.
  const requestContext = await buildAgentsRequestContext({
    subdomain: identity.subdomain,
    userId: identity.userId,
    provider: connection.provider,
    model: connection.model,
    thinkingLevel,
    codeModeEnabled: runSettings.codeModeEnabled,
    approvalMode: runSettings.approvalMode,
    threadId,
    attachmentUrls: [
      ...files.map((file) => file.url),
      ...selections.map((selection) => selection.snapshot.url),
    ],
    navigation,
  });

  // Only the newest message goes to the agent: Mastra memory loads history
  // from storage itself. modelSettings go via stream options (not the Agent
  // constructor's model list) because durable serialization drops
  // list-entry modelSettings but serializes stream-level ones.
  const start = async () => {
    // Memory saves a turn when its step ends, so a refresh during a long
    // first step would reload the thread without the prompt. Save it now;
    // the run's own save later upserts the same message id.
    const { MessageList } = await import('@mastra/core/agent');
    await runtime.memory.saveMessages({
      messages: new MessageList({ threadId, resourceId: identity.userId })
        .add(messageForModel, 'input')
        .get.all.db(),
    });

    return streamChat(res, runtime, {
      messages: [messageForModel],
      requestContext,
      modelSettings: buildAgentsModelSettings(connection.provider, thinkingLevel),
      ...buildRunOptions(identity, threadId),
    });
  };

  await (body.editMessageId
    ? withRewoundAgentsHistory({
        memory: runtime.memory,
        agent: runtime.agent,
        threadId,
        resourceId: identity.userId,
        messageId: body.editMessageId,
        start,
      })
    : start());
};

interface IChatRequestBody {
  messages?: UIMessage[];
  threadId?: unknown;
  provider?: string;
  model?: string;
  thinkingLevel?: string;
  fileIds?: unknown;
  pageContext?: unknown;
  navigation?: unknown;
  editMessageId?: string;
  resume?: unknown;
}

/**
 * One endpoint for every turn, keyed by the client's Chat id (the thread
 * id). A user message starts a run; an assistant message resumes the run it
 * is suspended on, with its approval decisions or an ask_user `resume`.
 */
router.post('/agents/chat', async (req, res) => {
  const identity = getIdentity(req);

  if (!identity) {
    jsonError(res, 401, new Error('Authentication required'));
    return;
  }

  const body = (req.body || {}) as IChatRequestBody;
  const threadId =
    typeof body.threadId === 'string' ? body.threadId.trim() : '';
  const newestMessage = Array.isArray(body.messages)
    ? body.messages[body.messages.length - 1]
    : undefined;

  if (!threadId || !newestMessage) {
    jsonError(res, 400, new Error('`threadId` and `messages` are required.'));
    return;
  }

  try {
    if (newestMessage.role === 'user') {
      await startUserTurn({ res, identity, threadId, newestMessage, body });
      return;
    }

    if (newestMessage.role !== 'assistant') {
      throw new HttpError(400, 'The newest message must be from the user or the assistant.');
    }

    await checkPermissionGroup(identity.subdomain, identity.user)('agentsChat');
    const runtime = await getAgentsRuntime(identity.subdomain);

    await streamChat(
      res,
      runtime,
      await buildResumeParams({
        runtime,
        identity,
        threadId,
        message: newestMessage,
        resume: body.resume,
      }),
    );
  } catch (error) {
    if (
      error instanceof AgentsPageSelectionError ||
      error instanceof AgentsFileBindError ||
      error instanceof AgentsMessageEditError
    ) {
      jsonError(res, error.statusCode, error);
      return;
    }

    jsonError(res, errorStatus(error), error);
  }
});

/**
 * The AI SDK's default reconnect route. Replays the thread's running run
 * from its start through the durable agent's `observe`, across replicas
 * over the shared Redis Streams bus; 204 when nothing is running.
 */
router.get('/agents/chat/:threadId/stream', async (req, res) => {
  const identity = getIdentity(req);

  if (!identity) {
    jsonError(res, 401, new Error('Authentication required'));
    return;
  }

  const { threadId } = req.params;

  try {
    await checkPermissionGroup(identity.subdomain, identity.user)('agentsChat');
    const runtime = await getAgentsRuntime(identity.subdomain);

    await assertOwnedThread(runtime.memory, identity, threadId);

    const { runs } = await runtime.agent.listActiveRuns({
      threadId,
      resourceId: identity.userId,
    });
    const run = runs[0];

    if (!run) {
      res.status(204).end();
      return;
    }

    // Native ownership/lease liveness keeps slow live runs open, while a
    // producerless running snapshot is settled without replaying its tools.
    // `observe` has no closeOnSuspend, so a run that suspends while
    // observed ends the response here.
    const observed = await runtime.agent.observe(run.runId, {
      idleTimeoutMs: AGENTS_RECONNECT_IDLE_TIMEOUT_MS,
      // Backend errors propagate: Mastra preserves the observer during a
      // transient storage/Redis failure instead of declaring a live run dead.
      isAlive: () =>
        isAgentsRunAlive(runtime, {
          runId: run.runId,
          threadId,
          resourceId: identity.userId,
        }),
      onSuspended: () => {
        if (!res.writableEnded) {
          res.end();
        }
      },
    });
    const { pipeUIMessageStreamToResponse } = await import('ai');
    const { toAISdkStream } = await import('@mastra/ai-sdk');

    pipeUIMessageStreamToResponse({
      response: res,
      stream: toAISdkStream(observed.output, {
        from: 'agent',
        version: 'v7',
        onError: describeStreamError,
      }),
    });
  } catch (error) {
    jsonError(res, errorStatus(error), error);
  }
});

