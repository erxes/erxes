import type { UIMessage } from 'ai';

export interface ITranscriptRow {
  /** Id of the row's first message — stable across merges. */
  key: string;
  /** Original object for a single-message row; a merged copy otherwise. */
  message: UIMessage;
  /** Original message right before the row's first message. */
  previousMessage: UIMessage | undefined;
  /** Index in `messages` of the row's last merged message. */
  lastIndex: number;
}

/**
 * Folds the flat message list into rendered rows. Turns `isHiddenTurn`
 * drops (stored ask_user answers, page-context-only bubbles) produce no
 * row, and an assistant message that follows another assistant row with
 * only hidden turns — or nothing — between them merges into that row so
 * consecutive work-steps cards render as one. Inputs are never mutated:
 * merged rows build a fresh message object, while single-message rows
 * keep the original identity for the memoized MessageRow.
 */
export const buildTranscriptRows = (
  messages: UIMessage[],
  isHiddenTurn: (
    message: UIMessage,
    previousMessage: UIMessage | undefined,
  ) => boolean,
): ITranscriptRow[] => {
  const rows: ITranscriptRow[] = [];

  messages.forEach((message, index) => {
    const previousMessage = index > 0 ? messages[index - 1] : undefined;

    if (isHiddenTurn(message, previousMessage)) {
      return;
    }

    const lastRow = rows[rows.length - 1];

    if (message.role === 'assistant' && lastRow?.message.role === 'assistant') {
      lastRow.message = {
        ...lastRow.message,
        parts: [...lastRow.message.parts, ...message.parts],
      };
      lastRow.lastIndex = index;
      return;
    }

    rows.push({
      key: message.id,
      message,
      previousMessage,
      lastIndex: index,
    });
  });

  return rows;
};
