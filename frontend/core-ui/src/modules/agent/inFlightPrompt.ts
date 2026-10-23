import { extractPageContext } from './utils/pageContext';
import {
  agentsPageSelectionsSchema,
  pageSelectionsPart,
  readPageSelectionsPart,
} from './pageSelections';
import type { UIMessage } from 'ai';
import {
  AGENTS_FILE_ONLY_TEXT,
  agentsFilesPart,
  isAgentsFileMeta,
  readAgentsFilesPart,
} from './agentsFiles';

/** Uses the existing prompt sessionStorage key; legacy values are plain text. */
export const encodeInFlightPrompt = (parts: UIMessage['parts']): string => {
  const text = parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n\n');
  const files = parts.flatMap(readAgentsFilesPart);
  const selections = parts.flatMap(readPageSelectionsPart);
  if (!files.length && !selections.length) return text;
  const userText = text.trim() || AGENTS_FILE_ONLY_TEXT;
  return JSON.stringify({
    text: userText,
    files,
    ...(selections.length ? { selections } : {}),
  });
};

export const decodeInFlightPrompt = (raw: string): UIMessage['parts'] => {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      'text' in value &&
      typeof value.text === 'string' &&
      'files' in value &&
      Array.isArray(value.files) &&
      value.files.every(isAgentsFileMeta)
    ) {
      const selections =
        'selections' in value
          ? agentsPageSelectionsSchema.safeParse(value.selections)
          : undefined;
      return [
        { type: 'text', text: value.text },
        ...(value.files.length ? [agentsFilesPart(value.files)] : []),
        ...(selections?.success ? [pageSelectionsPart(selections.data)] : []),
      ];
    }
  } catch {
    // Existing sessions stored the prompt as plain text.
  }
  return [{ type: 'text', text: raw }];
};

const fileIdsKey = (parts: UIMessage['parts']): string =>
  parts
    .flatMap(readAgentsFilesPart)
    .map((file) => file.url)
    .sort()
    .join(',');

const textKey = (parts: UIMessage['parts']): string =>
  parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n\n');

/** True when a stored user message is the same in-flight prompt, including files. */
export const inFlightPromptMatches = (
  inFlight: UIMessage['parts'],
  message: Pick<UIMessage, 'role' | 'parts'>,
): boolean =>
  message.role === 'user' &&
  textKey(inFlight) === textKey(extractPageContext(message.parts).parts) &&
  fileIdsKey(inFlight) === fileIdsKey(message.parts) &&
  JSON.stringify(
    inFlight
      .flatMap(readPageSelectionsPart)
      .map((selection) => [selection.id, selection.snapshot.url]),
  ) ===
    JSON.stringify(
      message.parts
        .flatMap(readPageSelectionsPart)
        .map((selection) => [selection.id, selection.snapshot.url]),
    );

/** Persist the actual SDK message identity before its HTTP request starts. */
export interface IInFlightTurn {
  id?: string;
  parts: UIMessage['parts'];
}
export const encodeInFlightTurn = (message: UIMessage): string =>
  JSON.stringify({
    version: 1,
    id: message.id,
    prompt: encodeInFlightPrompt(message.parts),
  });
export const decodeInFlightTurn = (raw: string): IInFlightTurn => {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === 'object' &&
      'version' in value &&
      value.version === 1 &&
      'id' in value &&
      typeof value.id === 'string' &&
      value.id.length > 0 &&
      'prompt' in value &&
      typeof value.prompt === 'string'
    ) {
      return { id: value.id, parts: decodeInFlightPrompt(value.prompt) };
    }
  } catch {
    /* Legacy sessions stored only prompt text. */
  }
  return { parts: decodeInFlightPrompt(raw) };
};

/** A replay replaces its active turn's response; it must not append to stored
 * output from the same run. Earlier turns, including identical prompts, stay. */
export const restoreInFlightTurn = (
  messages: UIMessage[],
  turn: IInFlightTurn | undefined,
  threadId: string,
  replay: boolean,
): UIMessage[] => {
  let index = -1;
  for (let cursor = messages.length - 1; cursor >= 0; cursor -= 1) {
    const message = messages[cursor];
    if (
      message.role === 'user' &&
      (!turn ||
        (turn.id
          ? message.id === turn.id
          : inFlightPromptMatches(turn.parts, message)))
    ) {
      index = cursor;
      break;
    }
  }
  if (turn && index < 0) {
    return [
      ...messages,
      {
        id: turn.id ?? `${threadId}:in-flight-prompt`,
        role: 'user',
        parts: turn.parts,
      },
    ];
  }
  return replay && index >= 0 ? messages.slice(0, index + 1) : messages;
};
