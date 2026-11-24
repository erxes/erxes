import { AssistantArtifact, type AssistantMessagePart } from '@erxes/core-contract';
import { z } from 'zod';
import { withoutUi } from './ui/blocks';

/** The entry kind the server writes for a member's message; its `data` is the parts as sent. */
const MEMBER_ENTRY = 'assistant.user';

/**
 * A member message's parts. The contract's `AssistantMessagePart` has this shape, but its module
 * builds schemas from tables, which stay out of the browser bundle.
 */
const MemberParts = z.array(z.looseObject({ type: z.string() }));

const Stamped = z.array(z.looseObject({ timestamp: z.number() }));

const Timestamp = z.number().optional();

const CallApiInput = z.object({
  procedure: z.string(),
  input: z.record(z.string(), z.unknown()).optional(),
  title: z
    .string()
    .transform((title) => title.slice(0, 120))
    .optional(),
});

const SearchApiInput = z.object({ query: z.string() });

const LoadSkillInput = z.object({ name: z.string() });

const Refusal = z.object({ ok: z.literal(false), message: z.string() });

const ChangedRecords = z.object({ changed: z.literal(true) });

const TextPart = z.object({ type: z.literal('text'), text: z.string() });

const Content = z.discriminatedUnion('type', [
  TextPart,
  z.object({ type: z.literal('thinking'), thinking: z.string() }),
  z.object({
    type: z.literal('toolCall'),
    id: z.string(),
    name: z.string(),
    arguments: z.unknown(),
  }),
]);

type Content = z.infer<typeof Content>;

type ToolCall = Extract<Content, { type: 'toolCall' }>;

const known = (parts: unknown[]) => parts.flatMap((part) => Content.safeParse(part).data ?? []);

/** A pi-ai assistant message: what the model said, thought and called, in order. */
const AssistantMessage = z.object({
  role: z.literal('assistant'),
  content: z.array(z.unknown()).transform(known),
  timestamp: Timestamp,
});

const ToolResult = z.object({
  role: z.literal('toolResult'),
  toolCallId: z.string(),
  content: z.array(z.looseObject({ type: z.string() })),
  isError: z.boolean(),
  timestamp: Timestamp,
});

type ToolResult = z.infer<typeof ToolResult>;

const ModelMessage = z.discriminatedUnion('role', [AssistantMessage, ToolResult]);

const Entry = z.object({
  id: z.number().transform(String),
  kind: z.string(),
  model: z.array(z.unknown()).optional(),
  data: z.unknown().optional(),
});

/** `pi.live`: `run` while a reply is being written, and the message the model streams now. */
const Live = z.object({
  run: z.looseObject({}).optional(),
  generation: z.object({ message: z.unknown().optional() }).optional(),
  runFailure: z.object({ reason: z.string(), detail: z.string().optional() }).optional(),
});

type RunFailure = NonNullable<z.infer<typeof Live>['runFailure']>;

/** What the panel says about a run that ended without an answer; `turn_limit`'s detail is `N turns`. */
const failureText = ({ reason, detail }: RunFailure) =>
  reason === 'turn_limit'
    ? `Stopped after ${detail ?? 'too many turns'}, the most one reply may take. Send a message to go on.`
    : (detail ?? reason);

type StepStatus = 'running' | 'done' | 'failed';

export interface Step {
  key: string;
  tool: string;
  name: string;
  title: string | null;
  query: string | null;
  status: StepStatus;
  input: unknown;
  output: unknown;
  error: string | null;
  at: number | null;
}

export type TranscriptRow =
  | { kind: 'text'; key: string; text: string; streaming: boolean }
  | { kind: 'thinking'; key: string; text: string; streaming: boolean; at: number | null }
  | { kind: 'steps'; key: string; steps: Step[] }
  | { kind: 'artifact'; key: string; artifact: AssistantArtifact };

export type TranscriptMessage =
  | { role: 'user'; key: string; parts: AssistantMessagePart[] }
  | {
      role: 'assistant';
      key: string;
      rows: TranscriptRow[];
      startedAt: number | null;
      endedAt: number | null;
    };

/** What a conversation view needs to have; the server's `ConversationView` is one. */
export interface ViewLike {
  entries: readonly unknown[];
  docs: Readonly<Record<string, unknown>>;
}

const parseJson = (text: string): unknown => {
  try {
    const value: unknown = JSON.parse(text);

    return value;
  } catch {
    return text;
  }
};

const resultText = (result: ToolResult) =>
  result.content.flatMap((part) => TextPart.safeParse(part).data?.text ?? []).join('\n');

const statusOf = (result: ToolResult | undefined, output: unknown): StepStatus => {
  if (!result) return 'running';

  return result.isError || Refusal.safeParse(output).success ? 'failed' : 'done';
};

const errorOf = (result: ToolResult | undefined, output: unknown) => {
  const refused = Refusal.safeParse(output).data?.message;

  if (refused) return refused;

  return result?.isError ? resultText(result) : null;
};

const stepOf = (call: ToolCall, result: ToolResult | undefined, calledAt: number | null): Step => {
  const tool = call.name;
  const api = tool === 'callApi' ? CallApiInput.safeParse(call.arguments).data : undefined;
  const skill = tool === 'loadSkill' ? LoadSkillInput.safeParse(call.arguments).data : undefined;
  const output = result ? parseJson(resultText(result)) : null;

  return {
    key: call.id,
    tool,
    name: api?.procedure ?? skill?.name ?? tool,
    title: api?.title || null,
    query:
      tool === 'searchApi' ? (SearchApiInput.safeParse(call.arguments).data?.query ?? null) : null,
    status: statusOf(result, output),
    input: api?.input ?? call.arguments,
    output: result?.isError ? null : output,
    error: errorOf(result, output),
    at: result?.timestamp ?? calledAt,
  };
};

interface ReplyPart {
  part: Content;
  key: string;
  streaming: boolean;
  at: number | null;
}

type Results = Map<string, ToolResult>;

const rowOfCall = (
  call: ToolCall,
  results: Results,
  calledAt: number | null,
): TranscriptRow | Step => {
  const step = stepOf(call, results.get(call.id), calledAt);

  if (call.name === 'createArtifact') {
    const artifact = AssistantArtifact.safeParse(step.output).data;

    if (artifact) return { kind: 'artifact', key: call.id, artifact };
  }

  return step;
};

const rowOf = (
  { part, key, streaming, at }: ReplyPart,
  results: Results,
): TranscriptRow | Step | null => {
  if (part.type === 'toolCall') return rowOfCall(part, results, at);

  if (part.type === 'text') {
    return part.text.trim() ? { kind: 'text', key, text: part.text, streaming } : null;
  }

  return part.thinking.trim()
    ? { kind: 'thinking', key, text: part.thinking, streaming, at }
    : null;
};

const isStep = (row: TranscriptRow | Step): row is Step => !('kind' in row);

const rowsOf = (parts: ReplyPart[], results: Results) => {
  const rows: TranscriptRow[] = [];
  let thought: Extract<TranscriptRow, { kind: 'thinking' }> | undefined;

  for (const part of parts) {
    const row = rowOf(part, results);

    if (!row) continue;

    if (!isStep(row) && row.kind === 'thinking' && thought) {
      thought.text = `${thought.text}\n\n${row.text}`;
      thought.streaming = row.streaming;

      continue;
    }

    if (!isStep(row) && row.kind === 'thinking') thought = row;

    const last = rows.at(-1);

    if (!isStep(row)) rows.push(row);
    else if (last?.kind === 'steps') last.steps.push(row);
    else rows.push({ kind: 'steps', key: `steps-${row.key}`, steps: [row] });
  }

  return rows;
};

interface ReplyMessage {
  content: Content[];
  streaming: boolean;
  at: number | null;
}

type Item =
  | { role: 'user'; key: string; parts: AssistantMessagePart[]; at: number | null }
  | { role: 'assistant'; key: string; messages: ReplyMessage[]; endedAt: number | null };

const replyParts = (key: string, messages: ReplyMessage[]) =>
  messages
    .flatMap(({ content, streaming, at }) =>
      content.map((part, index) => ({
        part,
        at,
        streaming: streaming && index === content.length - 1,
      })),
    )
    .map((part, index) => ({ ...part, key: `${key}-${index}` }));

const later = (current: number | null, next: number | undefined) =>
  next === undefined ? current : Math.max(current ?? next, next);

const itemsOf = (view: ViewLike, streamed: Content[] | undefined) => {
  const items: Item[] = [];
  const results = new Map<string, ToolResult>();

  const reply = () => {
    const last = items.at(-1);

    if (last?.role === 'assistant') return last;

    const next: Item = {
      role: 'assistant',
      key: `reply-${last?.key ?? 'start'}`,
      messages: [],
      endedAt: null,
    };

    items.push(next);

    return next;
  };

  for (const raw of view.entries) {
    const entry = Entry.safeParse(raw).data;

    if (entry?.kind === MEMBER_ENTRY) {
      const parts = MemberParts.safeParse(entry.data).data ?? [];
      const at = Stamped.safeParse(entry.model).data?.[0]?.timestamp ?? null;

      items.push({ role: 'user', key: entry.id, parts, at });
    } else {
      for (const message of entry?.model ?? []) {
        const parsed = ModelMessage.safeParse(message).data;

        if (!parsed) continue;

        const current = reply();

        current.endedAt = later(current.endedAt, parsed.timestamp);

        if (parsed.role === 'assistant') {
          current.messages.push({
            content: parsed.content,
            streaming: false,
            at: parsed.timestamp ?? null,
          });
        } else {
          results.set(parsed.toolCallId, parsed);
        }
      }
    }
  }

  if (streamed) reply().messages.push({ content: streamed, streaming: true, at: null });

  return { items, results };
};

const changedRecords = (message: TranscriptMessage | undefined) =>
  message?.role === 'assistant' &&
  message.rows.some(
    (row) =>
      row.kind === 'steps' &&
      row.steps.some(
        (step) => step.tool === 'callApi' && ChangedRecords.safeParse(step.output).success,
      ),
  );

/**
 * A conversation view as the panel draws it: the member's messages, and one reply for each run of
 * assistant and tool messages between them, with the message being streamed now at the end. A
 * reply with nothing to show is left out.
 */
export const transcriptOf = (view: ViewLike) => {
  const live = Live.safeParse(view.docs['pi.live'] ?? {}).data;
  const running = live?.run !== undefined;

  const streamed = running
    ? AssistantMessage.safeParse(live?.generation?.message).data?.content
    : undefined;

  const { items, results } = itemsOf(view, streamed);

  let askedAt: number | null = null;

  const messages = items.flatMap((item): TranscriptMessage[] => {
    if (item.role === 'user') {
      askedAt = item.at;

      return [{ role: 'user', key: item.key, parts: item.parts }];
    }

    const rows = rowsOf(replyParts(item.key, item.messages), results);
    const { key, endedAt } = item;

    return rows.length ? [{ role: 'assistant', key, rows, startedAt: askedAt, endedAt }] : [];
  });

  const last = messages.at(-1);
  const failure = running ? undefined : live?.runFailure;

  return {
    messages,
    running,
    changed: changedRecords(last),
    failure: failure && failure.reason !== 'aborted' ? failureText(failure) : null,
  };
};

export const userText = (parts: AssistantMessagePart[]) =>
  parts
    .flatMap((part) => TextPart.safeParse(part).data?.text ?? [])
    .join('\n\n')
    .trim();

export const replyText = (rows: TranscriptRow[]) =>
  rows
    .flatMap((row) => (row.kind === 'text' ? [withoutUi(row.text)] : []))
    .filter(Boolean)
    .join('\n\n')
    .trim();
