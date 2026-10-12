import type { Block } from '@blocknote/core';

const isMention = (
  item: unknown,
): item is { type: 'mention'; props: { _id: string } } =>
  typeof item === 'object' &&
  item !== null &&
  'type' in item &&
  item.type === 'mention' &&
  'props' in item &&
  typeof item.props === 'object' &&
  item.props !== null &&
  '_id' in item.props &&
  typeof item.props._id === 'string';

export const getMentionedUserIds = (content: readonly Block[] | undefined) =>
  (content || []).flatMap((block) => {
    const inlineContent: readonly unknown[] = Array.isArray(block.content)
      ? block.content
      : [];
    return inlineContent.filter(isMention).map((item) => item.props._id);
  });
