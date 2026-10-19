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
  if (!files.length) return text;
  const userText = text.trim() || AGENTS_FILE_ONLY_TEXT;
  return JSON.stringify({
    text: userText,
    files,
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
      return [{ type: 'text', text: value.text }, agentsFilesPart(value.files)];
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
  fileIdsKey(inFlight) === fileIdsKey(message.parts);
