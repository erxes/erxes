import type { AssistantMention } from '@erxes/core-contract';
import { RecordChip } from './RecordChip';

type Segment = { at: number } & ({ text: string } | { mention: AssistantMention });

const nextMention = (text: string, mentions: AssistantMention[]) =>
  mentions
    .map((mention) => ({ mention, at: text.indexOf(`@${mention.label}`) }))
    .filter(({ at }) => at >= 0)
    .toSorted((a, b) => a.at - b.at || b.mention.label.length - a.mention.label.length)[0];

const segmentsOf = (text: string, mentions: AssistantMention[], offset = 0): Segment[] => {
  const found = nextMention(text, mentions);

  if (!found) return text ? [{ at: offset, text }] : [];

  const end = found.at + found.mention.label.length + 1;

  return [
    ...(found.at > 0 ? [{ at: offset, text: text.slice(0, found.at) }] : []),
    { at: offset + found.at, mention: found.mention },
    ...segmentsOf(text.slice(end), mentions, offset + end),
  ];
};

export const MessageText = ({ text, mentions }: { text: string; mentions: AssistantMention[] }) => (
  <>
    {segmentsOf(text, mentions).map((segment) =>
      'mention' in segment ? (
        <RecordChip
          key={segment.at}
          type={segment.mention.type}
          id={segment.mention.id}
          label={segment.mention.label}
        />
      ) : (
        <span key={segment.at}>{segment.text}</span>
      ),
    )}
  </>
);
