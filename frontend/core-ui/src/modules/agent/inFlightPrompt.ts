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
  textKey(inFlight) === textKey(message.parts) &&
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
