import { useCallback, useMemo, useState } from 'react';

import {
  parseAgentMentionText,
  serializeAgentMentionText,
  validAgentMentionRanges,
  type IAgentMentionRange,
  type IAgentMentionText,
} from '../utils/mentionText';

const NO_MENTIONS: IAgentMentionRange[] = [];

export interface IAgentMentionsController {
  /** Mention ranges valid for the current visible text. */
  mentions: IAgentMentionRange[];
  /** Records the ranges that belong to `value` (called by the input). */
  commit: (next: IAgentMentionText) => void;
  /** Wire text for sending: mentions become `[[type:id:label]]` tokens. */
  serialize: (value: string) => string;
  /** Loads wire text (history edit) and returns its visible text. */
  load: (text: string) => string;
}

/**
 * Mention state over a text value owned by the caller. Ranges belong to one
 * exact value: when the caller replaces the text (send, reset, thread
 * switch), they no longer apply and the mentions are dropped automatically.
 */
export const useAgentMentions = (
  value: string,
  initial?: IAgentMentionText,
): IAgentMentionsController => {
  const [state, setState] = useState<IAgentMentionText>(
    () => initial ?? { value, mentions: NO_MENTIONS },
  );
  const mentions = useMemo(
    () =>
      state.value === value
        ? validAgentMentionRanges(value, state.mentions)
        : NO_MENTIONS,
    [state, value],
  );
  const commit = useCallback((next: IAgentMentionText) => setState(next), []);
  const serialize = useCallback(
    (text: string) =>
      serializeAgentMentionText(text, text === value ? mentions : NO_MENTIONS),
    [mentions, value],
  );
  const load = useCallback((text: string) => {
    const parsed = parseAgentMentionText(text);
    setState(parsed);
    return parsed.value;
  }, []);
  return { mentions, commit, serialize, load };
};
