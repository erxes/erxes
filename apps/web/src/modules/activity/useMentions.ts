import type { User } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { type KeyboardEvent, type RefObject, useState } from 'react';
import { activeMembersQuery, memberName } from '~/lib/members';

/** The `@word` being typed at the caret, if any. */
const mentionAt = (text: string, caret: number) => {
  const match = /(^|\s)@([^\s@]{0,30})$/.exec(text.slice(0, caret));
  const word = match?.[2];

  return word === undefined ? null : { query: word.toLowerCase(), start: caret - word.length - 1 };
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
  const team = useQuery(activeMembersQuery());
  const members = team.data?.data ?? [];
  const [mentions, setMentions] = useState(initial);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [highlight, setHighlight] = useState(0);

  const suggestions = mention
    ? members
        .filter((member) =>
          `${memberName(member)} ${member.email}`.toLowerCase().includes(mention.query),
        )
        .slice(0, 6)
    : [];

  const pick = (member: User) => {
    if (!mention) return;

    const name = memberName(member);
    const caret = textarea.current?.selectionStart ?? body.length;

    setBody(`${body.slice(0, mention.start)}@${name} ${body.slice(caret)}`);
    setMentions((current) => (current.includes(member.id) ? current : [...current, member.id]));
    setMention(null);
    requestAnimationFrame(() => {
      const position = mention.start + name.length + 2;

      textarea.current?.focus();
      textarea.current?.setSelectionRange(position, position);
    });
  };

  /** Arrows, Enter/Tab and Escape while suggesting; true when the key was used. */
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!suggestions.length) return false;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : suggestions.length - 1;

      setHighlight((index) => (index + step) % suggestions.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      const member = suggestions[highlight] ?? suggestions[0];

      if (member) pick(member);
    } else if (event.key === 'Escape') {
      setMention(null);
    } else {
      return false;
    }

    event.preventDefault();

    return true;
  };

  return {
    suggestions,
    highlight,
    pick,
    onKeyDown,
    /** The text changed: look for an `@word` at the caret. */
    onType: (text: string, caret: number) => {
      setMention(mentionAt(text, caret));
      setHighlight(0);
    },
    close: () => setMention(null),
    /** Only the people still named in the text. */
    mentionsIn: (text: string) =>
      mentions.filter((id) => {
        const member = members.find((item) => item.id === id);

        return member ? text.includes(`@${memberName(member)}`) : false;
      }),
    reset: () => setMentions([]),
  };
};
