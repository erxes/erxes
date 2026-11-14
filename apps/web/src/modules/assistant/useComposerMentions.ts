import { ASSISTANT_MENTION_MAX, type AssistantMention } from '@erxes/core-contract';
import { type KeyboardEvent, type RefObject, useState } from 'react';
import { useMentionInput } from '~/modules/activity/useMentions';
import { useMentionSearch } from './useMentionSearch';

const sameRecord = (a: AssistantMention, b: AssistantMention) => a.type === b.type && a.id === b.id;

export const useComposerMentions = ({
  body,
  setBody,
  textarea,
}: {
  body: string;
  setBody: (body: string) => void;
  textarea: RefObject<HTMLTextAreaElement | null>;
}) => {
  const input = useMentionInput<AssistantMention>({ body, setBody, textarea });
  const search = useMentionSearch(input.query);
  const [mentions, setMentions] = useState<AssistantMention[]>([]);

  const pick = (mention: AssistantMention) => {
    input.pick(mention.label);
    setMentions((current) =>
      current.length >= ASSISTANT_MENTION_MAX || current.some((item) => sameRecord(item, mention))
        ? current
        : [...current, mention],
    );
  };

  return {
    open: input.query !== null,
    ...search,
    highlight: input.highlight,
    setHighlight: input.setHighlight,
    pick,
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) =>
      input.onKeyDown(event, search.options, pick),
    onType: input.onType,
    close: input.close,
    inText: (text: string) => mentions.filter((mention) => text.includes(`@${mention.label}`)),
    reset: () => setMentions([]),
  };
};
