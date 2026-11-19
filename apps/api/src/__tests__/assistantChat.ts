import { applyImmutable } from '@earendil-works/chord/delta';
import type { Message } from '@earendil-works/pi-ai';
import type { ConversationView } from '@earendil-works/pi-durable';
import { AssistantMessagePart, type AssistantSendRequest } from '@erxes/core-contract';
import { z } from 'zod';
import type { CoreClient } from './support';

const Live = z.looseObject({
  run: z.unknown().optional(),
  generation: z
    .looseObject({
      message: z
        .looseObject({
          content: z.array(z.looseObject({ type: z.string(), text: z.string().optional() })),
        })
        .optional(),
    })
    .optional(),
});

const liveOf = (view: ConversationView) => Live.safeParse(view.docs['pi.live']).data;

/** The text of the answer being written now, before pi commits it. */
export const liveText = (view: ConversationView) =>
  liveOf(view)
    ?.generation?.message?.content.flatMap((part) =>
      part.type === 'text' && part.text ? [part.text] : [],
    )
    .join('') ?? '';

export const userMessage = (text: string) => ({ parts: [{ type: 'text', text }] });

/** The model messages of a conversation, in order. */
export const messagesOf = (view: ConversationView): Message[] =>
  view.entries.flatMap((entry) => entry.model ?? []);

const lastAssistant = (view: ConversationView) =>
  messagesOf(view).findLast((message) => message.role === 'assistant');

/** The text of the last answer. */
export const textOf = (view: ConversationView) => {
  const answer = lastAssistant(view);

  return answer?.role === 'assistant'
    ? answer.content.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('')
    : '';
};

/** No run is going, and the member's last message has its answer. */
const settled = (view: ConversationView) =>
  liveOf(view)?.run === undefined &&
  messagesOf(view).findLast((message) => message.role !== 'system')?.role !== 'user';

/** The calls the model made to `tool`, with their arguments. */
export const callsTo = (view: ConversationView, tool: string) =>
  messagesOf(view).flatMap((message) =>
    message.role === 'assistant'
      ? message.content.flatMap((part) =>
          part.type === 'toolCall' && part.name === tool ? [part.arguments] : [],
        )
      : [],
  );

/** What `tool` returned to the model, each result parsed from its JSON text. */
export const resultsOf = (view: ConversationView, tool: string) =>
  messagesOf(view).flatMap((message) =>
    message.role === 'toolResult' && message.toolName === tool
      ? message.content.flatMap((part) =>
          part.type === 'text'
            ? [message.isError ? part.text : z.json().parse(JSON.parse(part.text))]
            : [],
        )
      : [],
  );

/** The error texts `tool` returned to the model. */
export const errorsOf = (view: ConversationView, tool: string) =>
  messagesOf(view).flatMap((message) =>
    message.role === 'toolResult' && message.toolName === tool && message.isError
      ? message.content.flatMap((part) => (part.type === 'text' ? [part.text] : []))
      : [],
  );

/** The parts of each message the member sent, as the transcript stores them. */
export const userPartsOf = (view: ConversationView) =>
  view.entries.flatMap((entry) =>
    entry.kind === 'assistant.user' ? [z.array(AssistantMessagePart).parse(entry.data)] : [],
  );

/** Follows a thread until `done` holds for its view. */
export const follow = async (
  api: CoreClient,
  threadId: string,
  done: (view: ConversationView) => boolean = settled,
  timeoutMs = 8000,
) => {
  const events = await api.assistant.watch(
    { id: threadId },
    { signal: AbortSignal.timeout(timeoutMs) },
  );

  let view: ConversationView | undefined;

  const unfinished = () =>
    new Error(
      `The conversation was not done; its entries: ${JSON.stringify(
        view?.entries.map((entry) => ({ kind: entry.kind, data: entry.data, model: entry.model })),
      )}`,
    );

  try {
    for await (const event of events) {
      view = 'value' in event ? event.value : applyImmutable(view, event.ops);

      if (view && done(view)) return view;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') throw unfinished();

    throw error;
  }

  throw unfinished();
};

/** Sends a message and follows the thread until its run settles. */
export const chat = async (
  api: CoreClient,
  request: AssistantSendRequest,
  done: (view: ConversationView) => boolean = settled,
  timeoutMs?: number,
) => {
  const { threadId } = await api.assistant.send(request);

  return { threadId, view: await follow(api, threadId, done, timeoutMs) };
};
