import type { UIMessage } from 'ai';

import {
  AGENT_REFERENCE_TYPES,
  AGENT_REFERENCE_ID_RE,
  type TAgentReferenceType,
} from '../references/parseAgentReferences';

export const AGENT_PAGE_CONTEXT_PREFIX = '[Page context]';

export interface IAgentPageContext {
  path: string;
  record?: { type: TAgentReferenceType; id: string };
}

/**
 * Splits a user message's leading `[Page context] …` text part — persisted
 * by the backend inside the prompt it sent to the model — out of the
 * parts that should render as the user bubble. The context itself is
 * returned so it can render as a small chip under the bubble instead.
 */
export const extractPageContext = (
  parts: UIMessage['parts'],
): { context: IAgentPageContext | null; parts: UIMessage['parts'] } => {
  const first = parts[0];

  if (
    !first ||
    first.type !== 'text' ||
    typeof first.text !== 'string' ||
    !first.text.startsWith(AGENT_PAGE_CONTEXT_PREFIX)
  ) {
    return { context: null, parts };
  }

  return { context: parsePageContextText(first.text), parts: parts.slice(1) };
};

const RECORD_TYPES: ReadonlySet<string> = new Set(AGENT_REFERENCE_TYPES);

export const parsePageContextText = (text: string): IAgentPageContext => {
  const line = text
    .slice(AGENT_PAGE_CONTEXT_PREFIX.length)
    .trim()
    .split('\n')[0];

  const viewingMatch = /The user is viewing (\S+)\.?(?:\s|$)/.exec(line);
  const path = viewingMatch?.[1]?.replace(/\.$/, '') ?? '';
  const recordMatch = /Open record: (\S+) (\S+)/.exec(line);

  if (
    recordMatch &&
    RECORD_TYPES.has(recordMatch[1]) &&
    AGENT_REFERENCE_ID_RE.test(recordMatch[2])
  ) {
    return {
      path,
      record: {
        type: recordMatch[1] as TAgentReferenceType,
        id: recordMatch[2],
      },
    };
  }

  return { path };
};
