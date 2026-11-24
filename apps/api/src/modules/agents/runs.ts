import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import {
  type EntryRecord,
  hook,
  type HookApi,
  ROOT_CONVERSATION_ID,
  type SubmissionRecord,
  ToolTask,
} from '@earendil-works/pi-durable';
import { AGENT_CALLS_MAX, AGENT_RUNS_MAX, AgentCall } from '@erxes/core-contract';
import { z } from 'zod';
import { jsonOf } from '~/modules/apiTools/results';
import { sanitizeProviderMessage } from '~/modules/assistant/providers';
import { answerText, toolCallsOf } from './agent';
import { RUN_ENTRIES_MAX, runEntries } from './blocks';
import { openAgentStorage } from './storage';
import { agentTool } from './tool';

const HAND_OFF = 'handOff';

/** Refused or failed calls in one run after which core gives the conversation to a person. */
const FAILURES_MAX = 3;

const MESSAGE_MAX = 300;

const HandOffInput = z.object({
  reason: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .describe('For the team: what the customer wants, and what failed or why a person should help'),
  message: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .describe(
      "The one short line the customer reads, in the customer's language: a person will reply soon",
    ),
});

/** Gives the conversation to a person: the run ends, the plugin hears `core.agent.handed_off`. */
export const handOffTool = agentTool({
  name: HAND_OFF,
  description:
    'Give the conversation to a person on the team: when a call is refused or fails and no other call does the job, when the customer asks for a person, or when you cannot help. It ends your turn, and message is all the customer reads from you.',
  input: HandOffInput,
  execute: () => ({ handedOff: true }),
  terminate: true,
});

const ApiTool = AgentCall.shape.tool;

const CallInput = z.object({ procedure: z.string().optional(), query: z.string().optional() });

const Refused = z.object({
  ok: z.literal(false),
  code: z.string(),
  message: z.string(),
  status: z.int().optional(),
});

type Message = NonNullable<EntryRecord['model']>[number];

const textOf = (content: Message['content']) =>
  typeof content === 'string'
    ? content
    : content.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('\n');

/** The searchApi and callApi calls in these entries, in order, each with how it went. */
const callsOf = (entries: readonly EntryRecord[]) => {
  const results = new Map(
    entries
      .flatMap((entry) => entry.model ?? [])
      .flatMap((message) => (message.role === 'toolResult' ? [[message.toolCallId, message]] : [])),
  );

  return toolCallsOf(entries).flatMap((call) => {
    const tool = ApiTool.safeParse(call.name).data;

    if (!tool) return [];

    const input = CallInput.safeParse(call.arguments).data;
    const result = results.get(call.id);
    const text = result ? textOf(result.content) : '';
    const refused = Refused.safeParse(jsonOf(text)).data;
    const failed = Boolean(result?.isError) || refused !== undefined;

    return [
      {
        id: call.id,
        tool,
        procedure: tool === 'callApi' ? (input?.procedure ?? null) : null,
        query: tool === 'searchApi' ? (input?.query ?? null) : null,
        ok: !failed,
        status: refused?.status ?? null,
        code: refused?.code ?? (failed ? 'ERROR' : null),
        message: refused?.message ?? (failed ? text.slice(0, MESSAGE_MAX) : null),
      },
    ];
  });
};

const failuresIn = (entries: readonly EntryRecord[]) => callsOf(entries).filter((call) => !call.ok);

/**
 * Why a run gave the conversation to a person, and the line the customer reads: the agent's
 * handOff, else core's own once `FAILURES_MAX` calls failed. Null when it kept it.
 */
export const handOffOf = (entries: readonly EntryRecord[]) => {
  const [asked] = toolCallsOf(entries).flatMap((call) =>
    call.name === HAND_OFF ? (HandOffInput.safeParse(call.arguments).data ?? []) : [],
  );

  if (asked) return asked;

  const failed = failuresIn(entries);

  return failed.length >= FAILURES_MAX
    ? {
        reason: `${failed.length} calls failed; the last: ${failed.at(-1)?.message ?? 'no answer'}`,
        message: null,
      }
    : null;
};

/** What the customer reads from a run: its answer's text, else the line its handOff gave. */
export const replyOf = (entries: readonly EntryRecord[], answer: EntryRecord['id']) =>
  answerText(entries.find((entry) => entry.id === answer)) || (handOffOf(entries)?.message ?? '');

/** The model that answered last in these entries. */
export const modelOf = (entries: readonly EntryRecord[]) =>
  entries.flatMap((entry) => entry.model ?? []).findLast((message) => message.role === 'assistant')
    ?.model ?? null;

const isInput = (entry: EntryRecord) => entry.model?.[0]?.role === 'user';

/**
 * Refuses searchApi and callApi once `FAILURES_MAX` calls of the run failed, so the agent hands
 * off rather than try the same failing call again.
 */
export const failureGuard = hook(ToolTask, {
  beforeTool: async (call, api: HookApi, context) => {
    if (!ApiTool.safeParse(call.name).success) return undefined;

    const { items } = await api.entries(
      { order: 'descending' },
      RUN_ENTRIES_MAX,
      undefined,
      context,
    );

    const input = items.findIndex(isInput);
    const failed = failuresIn(input === -1 ? items : items.slice(0, input)).length;

    return failed >= FAILURES_MAX
      ? {
          block: `${failed} calls failed for this message, so no more calls: call ${HAND_OFF} now.`,
        }
      : undefined;
  },
});

const PROVIDER_FAILURES: [RegExp, string][] = [
  [
    /credit|balance|quota|billing|payment required|insufficient|\b402\b/i,
    'The AI provider has no credit left for this key: top it up, or connect another key in Settings › Integrations.',
  ],
  [
    /\b401\b|unauthori[sz]ed|invalid.{0,20}key|incorrect api key|authentication/i,
    'The AI provider rejected the API key: update it in Settings › Integrations.',
  ],
  [
    /\b429\b|rate.?limit|too many requests|overloaded/i,
    'The AI provider is rate-limiting this key: try again in a minute.',
  ],
  [
    /\b404\b|not.?found|does not exist|unknown model|no such model/i,
    "The AI provider has no such model: pick another in the agent's Setup.",
  ],
];

/** Why a run ended without an answer, for an admin: a provider's refusal by its cause. */
export const runFailureText = (reason: string, detail: unknown) => {
  const said = sanitizeProviderMessage(detail, '');

  if (reason === 'model_error') {
    const [, known] = PROVIDER_FAILURES.find(([pattern]) => pattern.test(said)) ?? [];

    return `${known ?? 'The AI provider failed to answer.'}${said ? ` It said: "${said}"` : ''}`;
  }

  if (reason === 'turn_limit') {
    return `It stopped after ${said || 'too many turns'}, the most one answer may take.`;
  }

  return `It ended without an answer (${reason}${said ? `: ${said}` : ''}).`;
};

type Input = Extract<SubmissionRecord, { type: 'input' }>;

const STATUS = {
  queued: 'running',
  placed: 'running',
  done: 'done',
  unanswered: 'failed',
} as const;

/** One run of the log: the message, the model, the calls and how it ended. */
const runOf = (input: Input, entries: readonly EntryRecord[]) => {
  const asked = entries.find((entry) => entry.id === input.entry)?.model?.[0];
  const handOff = handOffOf(entries);

  return {
    at: new Date(asked?.timestamp ?? 0),
    text: asked ? textOf(asked.content).slice(0, MESSAGE_MAX) : '',
    answer: input.status === 'done' ? replyOf(entries, input.answer) : '',
    model: modelOf(entries),
    status: STATUS[input.status],
    failure: input.status === 'unanswered' ? runFailureText(input.reason, input.detail) : null,
    handedOff: handOff?.reason ?? null,
    calls: callsOf(entries).slice(0, AGENT_CALLS_MAX),
  };
};

/**
 * A conversation's newest runs, newest first, read from its stored entries without opening it:
 * the server that runs it may be another.
 */
export const conversationRuns = async (orgId: string, storageKey: string) => {
  const storage = await openAgentStorage(orgId, storageKey, { readOnly: true });
  const conversationId = ROOT_CONVERSATION_ID;

  try {
    const { items } = await storage.scanSubmissions(
      { conversationId, order: 'descending' },
      AGENT_RUNS_MAX * 4,
      undefined,
      BACKGROUND_CONTEXT,
    );

    const inputs = items
      .flatMap((input) =>
        input.type === 'input' && input.entry !== undefined ? [{ input, first: input.entry }] : [],
      )
      .slice(0, AGENT_RUNS_MAX);

    const reader = {
      entries: (...[query, ...rest]: Parameters<HookApi['entries']>) =>
        storage.scanEntries({ ...query, conversationId }, ...rest),
    };

    return await Promise.all(
      inputs.map(async ({ input, first }, index) => {
        const next = inputs[index - 1]?.first;
        const entries = await runEntries(reader, first, next);

        return runOf(input, next ? entries.filter((entry) => entry.id < next) : entries);
      }),
    );
  } finally {
    await storage.close(BACKGROUND_CONTEXT);
  }
};
