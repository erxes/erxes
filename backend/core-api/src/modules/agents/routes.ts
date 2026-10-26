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
import type { DurableAgent } from '@mastra/core/agent/durable' with {
  'resolution-mode': 'import',
};
import type { MastraModelOutput } from '@mastra/core/stream' with {
  'resolution-mode': 'import',
};
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import { randomUUID } from 'crypto';
import express, { Router } from 'express';
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
import { getAgentsRuntime } from '@/agents/memory';
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
 * - `POST /agents/chat` streams an AI SDK v7 UI message stream over SSE
 *   from the tenant's DurableAgent. Accepts an optional client `runId`
 *   (valid UUID); generates one otherwise. Only the newest client message
 *   is forwarded; history is loaded from Mastra memory. An `onSuspended`
 *   callback ends the HTTP response after already-published suspension
 *   chunks so the AI SDK becomes ready for approve/answer.
 * - `POST /agents/approve` decides a run suspended on a destructive (or
 *   always-confirm) tool call via the durable agent's native
 *   `approveToolCall`/`declineToolCall`. Kind-aware discovery ensures an
 *   ask_user suspension is rejected with 409.
 * - `POST /agents/answer` resumes a run suspended by `ask_user` via the
 *   durable agent's native `resumeStream`.
 * - `POST /agents/chat/reconnect` observes an active run's stream for
 *   event replay after client disconnect, across replicas/processes via
 *   the shared Redis Streams bus.
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
  // Streaming routes (chat/approve/answer/reconnect) can fail AFTER the
  // SSE headers were already sent — a late stream error, or a suspension
  // callback that already ended the response. Writing a JSON error then
  // throws ERR_HTTP_HEADERS_SENT out of the catch block and crashes the
  // process. End the stream instead so the client sees a disconnect it can
  // recover from via reconnect/approve/answer.
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
 * Resolves the id a chat turn writes into and enforces ownership:
 * - a client-supplied id must belong to the acting user (403 otherwise),
 * - a missing id is auto-generated (Mastra creates the thread during
 *   `agent.stream` and derives its title from the first message).
 *
 * Mastra auto-creates the thread, so no pre-creation happens here.
 */
const resolveOwnedThreadId = async ({
  memory,
  identity,
  requestedThreadId,
}: {
  memory: MastraMemory;
  identity: IRequestIdentity;
  /** Client-provided thread id, or empty/undefined to start a new thread. */
  requestedThreadId?: string;
}): Promise<{ threadId: string; isNew: boolean }> => {
  const threadId = requestedThreadId?.trim() || randomUUID();

  // Only the acting user may continue an existing thread.
  const existing = await memory.getThreadById({ threadId });

  if (existing && existing.resourceId !== identity.userId) {
    throw new HttpError(403, 'Thread belongs to another user.');
  }

  return { threadId, isNew: !existing };
};

/**
 * Resolves the acting user's stored BYOK connection, shared by chat and
 * approve. Without one the user is told exactly what is missing; the key
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

/** UUID v4 pattern for validating client-supplied runIds. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (value: string): boolean => UUID_RE.test(value);

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

/**
 * Pipes a MastraModelOutput to the response as an AI SDK v7 UI message
 * stream, exposing the conversation id before streaming starts so clients
 * can continue the same thread on their next request.
 */
const pipeModelOutput = async (
  res: express.Response,
  threadId: string,
  output: MastraModelOutput,
): Promise<void> => {
  res.setHeader('X-Agents-Thread-Id', threadId);

  // 'ai' and '@mastra/ai-sdk' are ESM-only; load them dynamically from
  // CommonJS.
  const { pipeUIMessageStreamToResponse } = await import('ai');
  const { toAISdkStream } = await import('@mastra/ai-sdk');

  pipeUIMessageStreamToResponse({
    response: res,
    stream: toAISdkStream(output, {
      from: 'agent',
      version: 'v7',
      onError: (error) => describeStreamError(error),
    }),
  });
};

/** Which suspension kind a resume route decides. */
type ISuspensionKind = 'approval' | 'askUser';

/** A suspended tool call a resume route may decide or resume. */
interface ISuspendedToolCall {
  runId: string;
  toolCallId?: string;
}

/**
 * Shared preamble for both resume routes: resolves the tenant runtime and
 * re-checks thread ownership. The durable agent is stable per tenant — no
 * per-request agent build. Body selection fields (provider/model/thinking)
 * are accepted for compatibility but do NOT control rehydration; the
 * durable agent uses its registered/snapshot RequestContext so the original
 * run's provider/model/thinking/codeMode stay intact.
 */
const prepareResume = async (input: {
  identity: IRequestIdentity;
  threadId: string;
}): Promise<{ agent: DurableAgent; threadId: string }> => {
  await checkPermissionGroup(input.identity.subdomain, input.identity.user)('agentsChat');
  const runtime = await getAgentsRuntime(input.identity.subdomain);

  // Same ownership contract as chat and message reads: only the acting
  // user may resume a run suspended in their own thread.
  const thread = await runtime.memory.getThreadById({
    threadId: input.threadId,
  });

  if (!thread) {
    throw new HttpError(404, 'Thread not found.');
  }

  if (thread.resourceId !== input.identity.userId) {
    throw new HttpError(403, 'Thread belongs to another user.');
  }

  return { agent: runtime.agent, threadId: input.threadId };
};

/**
 * Resolves the newest suspended run and the tool call of the requested
 * kind it is waiting on — an approval-gated destructive call for
 * `/agents/approve`, a human-input call such as ask_user for
 * `/agents/answer`. Shared by both resume routes. Ownership has already
 * been re-checked by the caller; discovery stays storage-backed so
 * decisions survive restarts.
 *
 * Throws 409 via HttpError when the thread holds no decidable suspension
 * of the requested kind: nothing is suspended at all, or the newest run
 * waits on the other kind and its decision belongs to the sibling route.
 */
const findSuspendedToolCall = async (
  agent: DurableAgent,
  identity: IRequestIdentity,
  threadId: string,
  kind: ISuspensionKind,
  requestedToolCallId?: string,
): Promise<ISuspendedToolCall> => {
  // Suspended runs live in persistent snapshot storage (the shared
  // MongoDBStore's workflows domain), so discovery works across requests
  // and restarts. Results are newest-first; the newest suspended run is
  // the one awaiting a decision. Scoping by thread + resource means a
  // user can only ever resume their own runs.
  const { runs } = await agent.listSuspendedRuns({
    threadId,
    resourceId: identity.userId,
  });
  const run = runs[0];

  if (!run) {
    throw new HttpError(
      409,
      kind === 'approval'
        ? 'No pending approval exists for this thread.'
        : 'No pending interaction exists for this thread.',
    );
  }

  // A run suspends at one point, but its snapshot can hold several pending
  // calls (parallel steps), so select the first call of the requested kind
  // instead of assuming position 0.
  const calls = run.toolCalls ?? [];

  if (
    requestedToolCallId &&
    !calls.some((call) => call.toolCallId === requestedToolCallId)
  ) {
    throw new HttpError(409, 'This tool call is no longer awaiting a decision.');
  }

  if (calls.length === 0) {
    // Degenerate snapshot (no reported calls): keep the historical
    // unscoped resume and let Mastra resolve the run's pending call from
    // its own snapshot.
    return { runId: run.runId };
  }

  const toolCall = calls.find(
    (call) =>
      (!requestedToolCallId || call.toolCallId === requestedToolCallId) &&
      (call.requiresApproval === true) === (kind === 'approval'),
  );

  if (!toolCall) {
    throw new HttpError(
      409,
      kind === 'approval'
        ? 'This thread is waiting for an answer, not an approval decision.'
        : 'This thread is waiting for an approval decision, not an answer.',
    );
  }

  return {
    runId: run.runId,
    ...(toolCall.toolCallId ? { toolCallId: toolCall.toolCallId } : {}),
  };
};

/**
 * Resume options shared by approve/decline and answer. The durable agent
 * uses its registered/snapshot RequestContext so provider/model/thinking/
 * codeMode stay from the original run; only runId, toolCallId, memory,
 * step budget, and lifecycle callbacks are specified here. `onSuspended`
 * ends the HTTP response after already-published suspension chunks so a
 * resumed run that suspends again (chained approval) leaves the AI SDK
 * ready for the next approve/answer instead of hanging the SSE.
 */
const buildResumeOptions = ({
  suspended,
  identity,
  threadId,
  res,
}: {
  suspended: ISuspendedToolCall;
  identity: IRequestIdentity;
  threadId: string;
  res: express.Response;
}) => ({
  runId: suspended.runId,
  ...(suspended.toolCallId ? { toolCallId: suspended.toolCallId } : {}),
  maxSteps: AGENTS_MAX_STEPS,
  memory: {
    thread: threadId,
    resource: identity.userId,
    onTitleGenerated: () => publishAgentsThreadsChanged(identity.userId),
  },
  // Resumed completion also refreshes the thread list.
  onFinish: () => publishAgentsThreadsChanged(identity.userId),
  // Chained suspension: a resumed run that hits another gate must close
  // the response (headersSent is true during SSE; check writableEnded).
  onSuspended: () => {
    if (!res.writableEnded) {
      res.end();
    }
  },
});

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

router.post('/agents/chat', async (req, res) => {
  const identity = getIdentity(req);

  if (!identity) {
    jsonError(res, 401, new Error('Authentication required'));
    return;
  }

  const body = (req.body || {}) as {
    messages?: UIMessage[];
    threadId?: string;
    runId?: string;
    provider?: string;
    model?: string;
    thinkingLevel?: string;
    fileIds?: unknown;
    pageContext?: unknown;
    navigation?: unknown;
    editMessageId?: string;
  };

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    jsonError(res, 400, new Error('`messages` must be a non-empty array'));
    return;
  }

  // Mastra memory loads history from storage itself; forwarding the whole
  // client transcript would duplicate messages and risks ordering conflicts
  // with stored timestamps (see Mastra's message-history guidance).
  const newestMessage = body.messages[body.messages.length - 1];

  if (!newestMessage || newestMessage.role !== 'user') {
    jsonError(res, 400, new Error('The newest message must be from the user.'));
    return;
  }

  if (
    body.editMessageId !== undefined &&
    (typeof body.editMessageId !== 'string' ||
      !body.editMessageId.trim() ||
      body.editMessageId !== newestMessage.id ||
      !body.threadId)
  ) {
    jsonError(
      res,
      400,
      new Error('An edit must identify the user message and its existing thread.'),
    );
    return;
  }

  // Validate optional client-supplied runId: must be a valid UUID when
  // given. Guard the type first so a non-string value 400s instead of
  // throwing on `.trim()` (500).
  if (body.runId !== undefined && typeof body.runId !== 'string') {
    jsonError(res, 400, new Error('`runId` must be a valid UUID.'));
    return;
  }

  const rawRunId = typeof body.runId === 'string' ? body.runId.trim() : '';

  if (rawRunId && !isValidUUID(rawRunId)) {
    jsonError(res, 400, new Error('`runId` must be a valid UUID.'));
    return;
  }

  const runId = rawRunId || randomUUID();

  // Provider/model overrides must be strings when present; a wrong-typed
  // value 400s instead of throwing inside `pickConnection` (500).
  if (
    (body.provider !== undefined && typeof body.provider !== 'string') ||
    (body.model !== undefined && typeof body.model !== 'string')
  ) {
    jsonError(
      res,
      400,
      new Error('`provider` and `model` must be strings when provided.'),
    );
    return;
  }

  // Thread ids are client-generated UUIDs but historically arbitrary
  // strings; only guard the type here so a non-string value 400s instead
  // of throwing inside `resolveOwnedThreadId` (500).
  if (body.threadId !== undefined && typeof body.threadId !== 'string') {
    jsonError(res, 400, new Error('`threadId` must be a string when provided.'));
    return;
  }

  try {
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
    const connection = pickConnection(
      connections,
      body.provider,
      body.model,
    );
    const thinkingLevel = parseThinkingLevel(body.thinkingLevel);
    const runSettings = await resolveRunSettings(models);
    const runtime = await getAgentsRuntime(identity.subdomain);
    const { threadId, isNew } = await resolveOwnedThreadId({
      memory: runtime.memory,
      identity,
      requestedThreadId: body.threadId,
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

    // Use the tenant's stable DurableAgent. The dynamic model callback
    // reads provider/model/thinking/codeMode from the RequestContext above.
    // modelSettings go via stream options (not the Agent constructor's
    // model list) because durable serialization drops list-entry
    // modelSettings but serializes stream-level ones.
    const start = () => runtime.agent.stream([messageForModel], {
      runId,
      maxSteps: AGENTS_MAX_STEPS,
      modelSettings: buildAgentsModelSettings(
        connection.provider,
        thinkingLevel,
      ),
      memory: {
        thread: threadId,
        resource: identity.userId,
        onTitleGenerated: () => publishAgentsThreadsChanged(identity.userId),
      },
      onFinish: () => publishAgentsThreadsChanged(identity.userId),
      // End the HTTP response after already-published suspension chunks
      // so the AI SDK becomes ready for approve/answer. headersSent is
      // true during SSE streaming, so check writableEnded instead.
      onSuspended: () => {
        if (!res.writableEnded) {
          res.end();
        }
      },
      requestContext,
    });

    const result = body.editMessageId
      ? await withRewoundAgentsHistory({
          memory: runtime.memory,
          agent: runtime.agent,
          threadId,
          resourceId: identity.userId,
          messageId: body.editMessageId,
          start,
        })
      : await start();

    await pipeModelOutput(res, threadId, result.output);
  } catch (error) {
    if (
      error instanceof AgentsPageSelectionError ||
      error instanceof AgentsFileBindError ||
      error instanceof AgentsMessageEditError
    ) {
      jsonError(res, error.statusCode, error);
      return;
    }

    if (error instanceof ExpectedError && error.code === 'UNAUTHORIZED') {
      jsonError(res, 401, error);
      return;
    }

    if (error instanceof ExpectedError && error.code === 'FORBIDDEN') {
      jsonError(res, 403, error);
      return;
    }

    const status = errorStatus(error);

    jsonError(res, status, error);
  }
});

router.post('/agents/approve', async (req, res) => {
  const identity = getIdentity(req);

  if (!identity) {
    jsonError(res, 401, new Error('Authentication required'));
    return;
  }

  const body = (req.body || {}) as {
    threadId?: string;
    approved?: boolean;
    toolCallId?: string;
    reason?: string;
    provider?: string;
    model?: string;
    thinkingLevel?: string;
  };

  const threadId =
    typeof body.threadId === 'string' ? body.threadId.trim() : '';

  if (!threadId) {
    jsonError(res, 400, new Error('`threadId` is required.'));
    return;
  }

  if (typeof body.approved !== 'boolean') {
    jsonError(res, 400, new Error('`approved` must be true or false.'));
    return;
  }

  if (
    body.toolCallId !== undefined &&
    (typeof body.toolCallId !== 'string' ||
      !body.toolCallId.trim() ||
      body.toolCallId.length > 200)
  ) {
    jsonError(
      res,
      400,
      new Error('`toolCallId` must be a non-empty string of at most 200 characters.'),
    );
    return;
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

  try {
    const { agent } = await prepareResume({ identity, threadId });

    // Kind-aware discovery: an approval route must never decide an
    // ask_user suspension. When the newest run waits on a question, the
    // route answers 409 pointing the client at /agents/answer.
    const suspended = await findSuspendedToolCall(
      agent,
      identity,
      threadId,
      'approval',
      typeof body.toolCallId === 'string' ? body.toolCallId : undefined,
    );

    const options = buildResumeOptions({ suspended, identity, threadId, res });

    // The durable agent's native approveToolCall/declineToolCall routes
    // through the durable resume path, preserving the original run's
    // RequestContext snapshot (provider/model/thinking/codeMode).
    const output = body.approved
      ? await agent.approveToolCall(options)
      : await agent.declineToolCall({
          ...options,
          ...(reason ? { reason } : {}),
        });

    await pipeModelOutput(res, threadId, output);
  } catch (error) {
    const status = errorStatus(error);

    jsonError(res, status, error);
  }
});

router.post('/agents/answer', async (req, res) => {
  const identity = getIdentity(req);

  if (!identity) {
    jsonError(res, 401, new Error('Authentication required'));
    return;
  }

  const body = (req.body || {}) as {
    threadId?: string;
    answer?: unknown;
    provider?: string;
    model?: string;
    thinkingLevel?: string;
  };

  const threadId =
    typeof body.threadId === 'string' ? body.threadId.trim() : '';

  if (!threadId) {
    jsonError(res, 400, new Error('`threadId` is required.'));
    return;
  }

  // ask_user accepts free-text and single-select answers (string), a
  // multi-select answer (string array), or — for multi-question
  // suspensions — one answer per question positionally (each element a
  // string or a string array). Anything else is a client bug, not an
  // answer — reject it rather than resuming the run with garbage.
  const isString = typeof body.answer === 'string' && body.answer.trim() !== '';
  const isNonEmptyStringArray = (value: unknown[]): boolean =>
    value.length > 0 &&
    value.every((item) => typeof item === 'string' && item.trim() !== '');
  const isAnswerList =
    Array.isArray(body.answer) &&
    body.answer.length > 0 &&
    body.answer.every(
      (item) =>
        (Array.isArray(item) && isNonEmptyStringArray(item)) ||
        (typeof item === 'string' && item.trim() !== ''),
    );

  if (!isString && !isAnswerList) {
    jsonError(
      res,
      400,
      new Error(
        '`answer` must be a non-empty string, a non-empty string array, or an array of per-question answers.',
      ),
    );
    return;
  }

  // The validation above guarantees the shape: a string, or an array whose
  // items are all strings or arrays of strings — so this trim is total.
  const answer: string | (string | string[])[] = isString
    ? (body.answer as string).trim()
    : (body.answer as (string | string[])[]).map((item) =>
        Array.isArray(item) ? item.map((part) => part.trim()) : item.trim(),
      );

  try {
    const { agent } = await prepareResume({ identity, threadId });

    // Kind-aware discovery: an answer route must never resume an
    // approval-gated suspension — that would execute the gated tool. Only
    // a human-input suspension (requiresApproval false) is resumed here.
    const suspended = await findSuspendedToolCall(
      agent,
      identity,
      threadId,
      'askUser',
    );

    // The durable agent's native resumeStream routes through the durable
    // resume path, preserving the original run's RequestContext snapshot.
    const output = await agent.resumeStream(
      answer,
      buildResumeOptions({ suspended, identity, threadId, res }),
    );

    await pipeModelOutput(res, threadId, output);
  } catch (error) {
    const status = errorStatus(error);

    jsonError(res, status, error);
  }
});

/**
 * Reconnect to an active run's stream for event replay after client
 * disconnect. Uses the durable agent's native `observe(runId)` to
 * subscribe to the run's pubsub topic — no homemade replay.
 *
 * Stream events publish to the process-wide Redis Streams bus, so replay
 * works across API replicas and processes (and across a browser refresh);
 * retained stream entries also replay events the client missed. Persistent
 * Mongo snapshots separately provide suspension resume after restart.
 */
router.post('/agents/chat/reconnect', async (req, res) => {
  const identity = getIdentity(req);

  if (!identity) {
    jsonError(res, 401, new Error('Authentication required'));
    return;
  }

  const body = (req.body || {}) as {
    threadId?: string;
    runId?: string;
  };

  const threadId =
    typeof body.threadId === 'string' ? body.threadId.trim() : '';
  const runId =
    typeof body.runId === 'string' ? body.runId.trim() : '';

  if (!threadId || !runId) {
    jsonError(
      res,
      400,
      new Error('`threadId` and `runId` are required.'),
    );
    return;
  }

  if (!isValidUUID(runId)) {
    jsonError(res, 400, new Error('`runId` must be a valid UUID.'));
    return;
  }

  try {
    await checkPermissionGroup(identity.subdomain, identity.user)('agentsChat');
    const runtime = await getAgentsRuntime(identity.subdomain);

    // Verify thread belongs to acting user.
    const thread = await runtime.memory.getThreadById({ threadId });

    if (!thread) {
      jsonError(res, 404, new Error('Thread not found.'));
      return;
    }

    if (thread.resourceId !== identity.userId) {
      jsonError(res, 403, new Error('Thread belongs to another user.'));
      return;
    }

    // Only observe when that exact run is active; 204 if not.
    const { runs } = await runtime.agent.listActiveRuns({
      threadId,
      resourceId: identity.userId,
    });
    const isActive = runs.some((r) => r.runId === runId);

    if (!isActive) {
      res.status(204).end();
      return;
    }

    // Pipe the observed output through the same AI SDK v7 SSE pipeline.
    // Pass onSuspended so a run that suspends after reconnect ends the
    // HTTP response (headersSent is true during SSE; check writableEnded).
    // Native ownership/lease liveness keeps slow live runs open, while a
    // producerless running snapshot is settled without replaying its tools.
    const observed = await runtime.agent.observe(runId, {
      idleTimeoutMs: AGENTS_RECONNECT_IDLE_TIMEOUT_MS,
      // Backend errors propagate: Mastra preserves the observer during a
      // transient storage/Redis failure instead of declaring a live run dead.
      isAlive: () => isAgentsRunAlive(runtime, {
        runId,
        threadId,
        resourceId: identity.userId,
      }),
      onSuspended: () => {
        if (!res.writableEnded) {
          res.end();
        }
      },
    });

    await pipeModelOutput(res, threadId, observed.output);
  } catch (error) {
    const status = errorStatus(error);

    jsonError(res, status, error);
  }
});
