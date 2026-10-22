import { isTextUIPart } from 'ai';

import { agentsFilesDisplayText } from '../agentsFiles';
import { pageSelectionsDisplayText } from '../pageSelections';
import type { AgentsUIMessage } from '../types';

/**
 * Ask_user answers travel through the send pipeline as user messages (the
 * transport reroutes them to the answer endpoint), but they display as the
 * assistant's answered Q&A card — never as a bubble of their own. The send
 * marks them with `metadata.agentsAnswer`.
 */
export const isAgentsAnswerTurn = (message: AgentsUIMessage): boolean =>
  message.metadata?.agentsAnswer === true;

/** Joins a message's text parts — the only parts shown as bubbles. */
export const getMessageText = (message: AgentsUIMessage): string =>
  message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join('');

/**
 * A user message that carried files or page selections shows its short
 * display text, not the file contents the turn injected for the model.
 */
export const withUserDisplayText = (
  messages: AgentsUIMessage[],
): AgentsUIMessage[] =>
  messages.map((message) => {
    if (message.role !== 'user') return message;
    const displayText =
      agentsFilesDisplayText(message.parts) ??
      pageSelectionsDisplayText(message.parts);
    if (displayText === undefined) return message;
    return {
      ...message,
      parts: [
        { type: 'text', text: displayText },
        ...message.parts.filter((part) => part.type !== 'text'),
      ],
    };
  });
