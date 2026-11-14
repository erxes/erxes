import type { User } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { type KeyboardEvent, type RefObject, useState } from 'react';
import { memberQueries } from '@erxes/core-contract/client';
import { memberName } from 'erxes-ui';

interface MentionAt {
  query: string;
  start: number;
}

/** The `@word` being typed at the caret, if any. */
const mentionAt = (text: string, caret: number): MentionAt | null => {
  const match = /(^|\s)@([^\s@[\]]{0,40})$/.exec(text.slice(0, caret));
  const word = match?.[2];

  return word === undefined ? null : { query: word, start: caret - word.length - 1 };
};

/**
 * The `@word` at the caret of a textarea and the suggestion it highlights.
 * `pick` puts `@name ` in place of the word and the caret after it; `onKeyDown`
 * handles arrows, Enter/Tab and Escape while suggesting and says whether it used the key.
 */
export const useMentionInput = <T>({
  body,
  setBody,
  textarea,
}: {
  body: string;
  setBody: (body: string) => void;
  textarea: RefObject<HTMLTextAreaElement | null>;
}) => {
  const [mention, setMention] = useState<MentionAt | null>(null);
  const [highlight, setHighlight] = useState(0);

  const pick = (name: string) => {
    if (!mention) return;

    const caret = textarea.current?.selectionStart ?? body.length;
    const after = body.slice(caret).replace(/^ /, '');

    setBody(`${body.slice(0, mention.start)}@${name} ${after}`);
    setMention(null);
    requestAnimationFrame(() => {
      const position = mention.start + name.length + 2;

      textarea.current?.focus();
      textarea.current?.setSelectionRange(position, position);
    });
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
    suggestions: T[],
    onPick: (item: T) => void,
  ) => {
    if (!mention || !suggestions.length) return false;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : suggestions.length - 1;

      setHighlight((index) => (index + step) % suggestions.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      const item = suggestions[highlight] ?? suggestions[0];

      if (item) onPick(item);
    } else if (event.key === 'Escape') {
      setMention(null);
    } else {
      return false;
    }

    event.preventDefault();

    return true;
  };

  return {
    query: mention?.query ?? null,
    highlight,
    setHighlight,
    pick,
    onKeyDown,
    /** The text changed: look for an `@word` at the caret. */
    onType: (text: string, caret: number) => {
      setMention(mentionAt(text, caret));
      setHighlight(0);
    },
    close: () => setMention(null),
  };
};

/**
 * `@` mentions in a note: suggests active teammates for the word at the
 * caret, inserts the picked name and remembers whom the note mentions.
 */
export const useMentions = ({
  body,
  setBody,
  initial,
  textarea,
}: {
  body: string;
  setBody: (body: string) => void;
  initial: string[];
  textarea: RefObject<HTMLTextAreaElement | null>;
}) => {
  const team = useQuery(memberQueries.team);
  const members = team.data?.data ?? [];
  const [mentions, setMentions] = useState(initial);
  const input = useMentionInput<User>({ body, setBody, textarea });
  const query = input.query?.toLowerCase();

  const suggestions =
    query === undefined
      ? []
      : members
          .filter((member) => `${memberName(member)} ${member.email}`.toLowerCase().includes(query))
          .slice(0, 6);

  const pick = (member: User) => {
    input.pick(memberName(member));
    setMentions((current) => (current.includes(member.id) ? current : [...current, member.id]));
  };

  return {
    suggestions,
    highlight: input.highlight,
    pick,
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) =>
      input.onKeyDown(event, suggestions, pick),
    onType: input.onType,
    close: input.close,
    /** Only the people still named in the text. */
    mentionsIn: (text: string) =>
      mentions.filter((id) => {
        const member = members.find((item) => item.id === id);

        return member ? text.includes(`@${memberName(member)}`) : false;
      }),
    reset: () => setMentions([]),
  };
};
